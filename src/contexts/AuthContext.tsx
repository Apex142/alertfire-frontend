/* -------------------------------------------------------------------------- */
/*  AuthContext – Next 13+  |  React 18  |  “use client”                      */
/* -------------------------------------------------------------------------- */

"use client";

import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { createAuthClient } from "@/lib/auth/AuthClientFactory";
import { AnyFirebaseUser } from "@/lib/auth/IAuthClient";
import { db } from "@/lib/firebase/client";
import { createAuthService } from "@/services/AuthService";
import { sessionService } from "@/services/SessionService";
import type { Session } from "@/types/entities/Session";
import type { User as AppUser } from "@/types/entities/User";

const SESSION_ID_STORAGE_KEY = "sessionId";

/* -------------------------------------------------------------------------- */
/*  Types & contexte                                                          */
/* -------------------------------------------------------------------------- */

interface AuthContextType {
  firebaseUser: AnyFirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  currentSessionId: string | null;
  logout: (reason?: string) => Promise<void>;
  setSessionDetails: (u: AppUser | null, s: Session | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  /* ---------- state ------------------------------------------------------ */

  const [firebaseUser, setFirebaseUser] = useState<AnyFirebaseUser | null>(
    null
  );
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const firebaseUserRef = useRef<AnyFirebaseUser | null>(null);
  const appUserRef = useRef<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* session courante  ----------------------------------------------------- */
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);

  /* service métier Firebase ----------------------------------------------- */
  const authServiceRef = useRef<Awaited<
    ReturnType<typeof createAuthService>
  > | null>(null);
  const [serviceReady, setServiceReady] = useState(false);

  /* listeners Firestore ---------------------------------------------------- */
  const userDocListenerRef = useRef<Unsubscribe | null>(null);
  const sessionDocListenerRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    firebaseUserRef.current = firebaseUser;
  }, [firebaseUser]);

  useEffect(() => {
    appUserRef.current = appUser;
  }, [appUser]);

  /* ----------------------------------------------------------------------- */
  /*  Boot – charge AuthService + lit localStorage                           */
  /* ----------------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    createAuthService().then((svc) => {
      if (cancelled) return;
      authServiceRef.current = svc;
      setServiceReady(true);
    });

    const stored = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    setCurrentSessionId(stored);
    currentSessionIdRef.current = stored;

    return () => void (cancelled = true);
  }, []);

  /* ----------------------------------------------------------------------- */
  /*  Helpers                                                                */
  /* ----------------------------------------------------------------------- */

  const clearListeners = useCallback(() => {
    userDocListenerRef.current?.();
    sessionDocListenerRef.current?.();
    userDocListenerRef.current = null;
    sessionDocListenerRef.current = null;
  }, []);

  const performLogout = useCallback(
    async (reason = "Manual logout", forceSessionId?: string | null) => {
      setLoading(true);
      clearListeners();

      const sessionId = forceSessionId ?? currentSessionIdRef.current;
      const authService = authServiceRef.current;
      const hadFirebaseUser = firebaseUserRef.current;
      const shouldSignOut = Boolean(
        (forceSessionId ?? sessionId) || hadFirebaseUser
      );

      /* feedback ---------------------------------------------------------- */
      if (/expired|revoked/.test(reason)) toast.warning("Session expirée.");
      else if (/bann?ed/.test(reason)) toast.error("Compte banni.");
      else if (reason !== "Manual logout")
        toast.info(`Déconnexion : ${reason}`);

      /* 1️⃣  Supprime le document session côté API ----------------------- */
      if (sessionId) {
        await fetch(`/api/auth/session/${sessionId}`, {
          method: "DELETE",
        }).catch(() => {});
      }

      /* 2️⃣  Firebase sign-out ------------------------------------------ */
      if (shouldSignOut) {
        await authService?.signOutUser(sessionId ?? undefined).catch(() => {});
      }

      /* 3️⃣  Nettoie le cookie httpOnly ---------------------------------- */
      await fetch("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ action: "logout" }),
      }).catch(() => {});

      /* 4️⃣  Reset local -------------------------------------------------- */
      setFirebaseUser(null);
      firebaseUserRef.current = null;
      setAppUser(null);
      appUserRef.current = null;
      setCurrentSessionId(null);
      currentSessionIdRef.current = null;
      localStorage.removeItem(SESSION_ID_STORAGE_KEY);

      setLoading(false);
    },
    [clearListeners]
  );

  const setSessionDetails = useCallback(
    (user: AppUser | null, session: Session | null) => {
      setAppUser(user);
      appUserRef.current = user;
      setCurrentSessionId(session?.sessionId ?? null);
      currentSessionIdRef.current = session?.sessionId ?? null;

      if (session?.sessionId) {
        localStorage.setItem(SESSION_ID_STORAGE_KEY, session.sessionId);
      } else {
        localStorage.removeItem(SESSION_ID_STORAGE_KEY);
      }
    },
    []
  );

  /* ----------------------------------------------------------------------- */
  /*  Auth state listener (uniquement quand le service est prêt)             */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    if (!serviceReady) return;

    const authClient = createAuthClient();
    if (!authClient) {
      setLoading(false);
      return;
    }

    const unsubscribe = authClient.addAuthListener(async (user) => {
      const hadExistingState = Boolean(
        firebaseUserRef.current ||
          appUserRef.current ||
          currentSessionIdRef.current
      );

      if (!user && !hadExistingState) {
        setLoading(false);
        return;
      }

      setLoading(true);
      clearListeners();

      /* A. Pas de user -> logout complet ---------------------------------- */
      if (!user) {
        await performLogout();
        return;
      }

      /* B. User présent --------------------------------------------------- */
      setFirebaseUser(user);
      firebaseUserRef.current = user;

      try {
        const authService = authServiceRef.current!;
        let profile = await authService.getAppUserProfile(user.uid);

        if (!profile) {
          profile = await authService.createUserProfile(user);
          toast.success("Profil utilisateur créé.");
        }
        if (profile.isBanned) {
          await performLogout("User banned");
          return;
        }
        setAppUser(profile);
        appUserRef.current = profile;

        /* session la + récente non révoquée -------------------------------- */
        const sessions = await sessionService.getUserSessions(user.uid);
        const active =
          sessions
            ?.filter((s) => !s.revoked)
            .sort(
              (a, b) =>
                (b.createdAt?.toMillis?.() ?? 0) -
                (a.createdAt?.toMillis?.() ?? 0)
            )[0] ?? null;
        setSessionDetails(profile, active);

        /* listener user doc ------------------------------------------------ */
        userDocListenerRef.current = onSnapshot(
          doc(db, "users", user.uid),
          async (snap) => {
            if (!snap.exists()) return performLogout("User doc deleted");
            const updated = snap.data() as AppUser;
            setAppUser(updated);
            appUserRef.current = updated;
            if (updated.isBanned) await performLogout("User banned");
          },
          () => performLogout("User doc listener error")
        );

        /* cookie httpOnly -------------------------------------------------- */
        const token = await authClient.getIdToken();
        if (token) {
          await fetch("/api/auth/session", {
            method: "POST",
            body: JSON.stringify({ action: "login", token }),
          }).catch(() => {});
        }
      } catch (err) {
        console.error("Auth init error:", err);
        toast.error("Erreur d’initialisation.");
        await performLogout("Init error");
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearListeners();
    };
  }, [serviceReady, performLogout, clearListeners, setSessionDetails]);

  /* ----------------------------------------------------------------------- */
  /*  Listener sur le document de session actif                              */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    sessionDocListenerRef.current?.(); // stop éventuel précédent

    if (currentSessionId && appUser && firebaseUser) {
      sessionDocListenerRef.current = onSnapshot(
        doc(db, "sessions", currentSessionId),
        async (snap) => {
          if (!snap.exists()) return performLogout("Session doc deleted");

          const s = snap.data() as Session;
          const isExpired = s.expiresAt?.toDate().getTime() < Date.now();

          /* ⚠️  NE déconnecte plus si un *autre* device crée une nouvelle   */
          /*     session : on ne vérifie plus “uid mismatch” ni “revoked     */
          /*     flag” posé par createSession() ailleurs.                     */
          if (isExpired) await performLogout("Session expired");
        },
        () => performLogout("Session doc listener error")
      );
    }

    return () => sessionDocListenerRef.current?.();
  }, [currentSessionId, appUser, firebaseUser, performLogout]);

  /* ----------------------------------------------------------------------- */
  /*  Fallback UI                                                            */
  /* ----------------------------------------------------------------------- */

  if (!loading && firebaseUser && !appUser) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
        <p className="mb-4 text-lg font-semibold">
          Profil utilisateur manquant
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Contactez le support ou déconnectez-vous.
        </p>
        <button
          className="rounded bg-primary px-4 py-2 text-white"
          onClick={() => performLogout("Fallback logout")}
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /*  Provider                                                               */
  /* ----------------------------------------------------------------------- */

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        loading,
        currentSessionId,
        logout: performLogout,
        setSessionDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hook utilitaire                                                           */
/* -------------------------------------------------------------------------- */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être appelé dans un <AuthProvider>");
  return ctx;
}
