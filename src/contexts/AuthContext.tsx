"use client";

import { createAuthClient } from "@/lib/auth/AuthClientFactory";
import { AnyFirebaseUser } from "@/lib/auth/IAuthClient";
import { db } from "@/lib/firebase/client";
import { createAuthService } from "@/services/AuthService";
import { sessionService } from "@/services/SessionService";
import type { Session } from "@/types/entities/Session";
import type { User as AppUser } from "@/types/entities/User";
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

const SESSION_ID_STORAGE_KEY = "sessionId";

interface AuthContextType {
  firebaseUser: AnyFirebaseUser;
  appUser: AppUser | null;
  loading: boolean;
  currentSessionId: string | null;
  logout: (reason?: string) => Promise<void>;
  setSessionDetails: (user: AppUser | null, session: Session | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<AnyFirebaseUser>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);

  const userDocListenerRef = useRef<Unsubscribe | null>(null);
  const sessionDocListenerRef = useRef<Unsubscribe | null>(null);
  const authServiceRef = useRef<Awaited<
    ReturnType<typeof createAuthService>
  > | null>(null);

  useEffect(() => {
    createAuthService().then((service) => {
      authServiceRef.current = service;
    });
  }, []);

  useEffect(() => {
    const id = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    setCurrentSessionId(id);
    currentSessionIdRef.current = id;
  }, []);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
    if (currentSessionId) {
      localStorage.setItem(SESSION_ID_STORAGE_KEY, currentSessionId);
    } else {
      localStorage.removeItem(SESSION_ID_STORAGE_KEY);
    }
  }, [currentSessionId]);

  const clearListeners = useCallback(() => {
    userDocListenerRef.current?.();
    sessionDocListenerRef.current?.();
    userDocListenerRef.current = null;
    sessionDocListenerRef.current = null;
  }, []);

  const performLogout = useCallback(
    async (reason?: string, forceSessionId?: string | null) => {
      setLoading(true);
      clearListeners();

      const authService = authServiceRef.current;
      const sessionId = forceSessionId ?? currentSessionIdRef.current;

      try {
        if (reason?.includes("expired") || reason?.includes("revoked")) {
          toast.warning("Votre session a expiré ou a été révoquée.");
        } else if (reason?.includes("banned")) {
          toast.error("Votre compte a été banni.");
        } else if (reason && reason !== "Manual user logout") {
          toast.info(`Déconnexion : ${reason}`);
        }

        if (sessionId) {
          await fetch(`/api/session/${sessionId}/delete`, { method: "POST" });
        }

        if (authService) {
          await authService.signOutUser(sessionId ?? undefined);
        }

        await fetch("/api/auth/session", {
          method: "POST",
          body: JSON.stringify({ action: "logout" }),
        }).catch(() => {});

        setFirebaseUser(null);
        setAppUser(null);
        setCurrentSessionId(null);
        currentSessionIdRef.current = null;
        localStorage.removeItem(SESSION_ID_STORAGE_KEY);
      } catch (err) {
        console.error("performLogout error:", err);
      }
      setLoading(false);
    },
    [clearListeners]
  );

  const setSessionDetailsAction = (
    user: AppUser | null,
    session: Session | null
  ) => {
    setAppUser(user);
    setCurrentSessionId(session?.sessionId ?? null);
    currentSessionIdRef.current = session?.sessionId ?? null;
    if (session?.sessionId) {
      localStorage.setItem(SESSION_ID_STORAGE_KEY, session.sessionId);
    } else {
      localStorage.removeItem(SESSION_ID_STORAGE_KEY);
    }
  };

  useEffect(() => {
    const authClient = createAuthClient();
    if (!authClient) return;

    const unsubscribe = authClient.addAuthListener(async (user) => {
      setLoading(true);
      clearListeners();

      if (!user) {
        setFirebaseUser(null);
        setAppUser(null);
        setCurrentSessionId(null);
        currentSessionIdRef.current = null;
        localStorage.removeItem(SESSION_ID_STORAGE_KEY);
        await fetch("/api/auth/session", {
          method: "POST",
          body: JSON.stringify({ action: "logout" }),
        }).catch(() => {});
        setLoading(false);
        return;
      }

      setFirebaseUser(user);

      try {
        const authService = authServiceRef.current;
        if (!authService) return;

        let appUser = await authService.getAppUserProfile(user.uid);
        if (!appUser) {
          appUser = await authService.createUserProfile(user);
          toast.success("Profil utilisateur créé automatiquement.");
        }

        if (appUser.isBanned) {
          await performLogout("User is banned");
          return;
        }

        setAppUser(appUser);

        const sessions = await sessionService.getUserSessions(user.uid);
        const active =
          sessions
            ?.filter((s) => !s.revoked)
            .sort(
              (a, b) =>
                (b.createdAt?.toMillis?.() ?? 0) -
                (a.createdAt?.toMillis?.() ?? 0)
            )[0] ?? null;

        setSessionDetailsAction(appUser, active);

        userDocListenerRef.current = onSnapshot(
          doc(db, "users", user.uid),
          async (snap) => {
            if (!snap.exists()) {
              await performLogout("User document deleted from Firestore");
              return;
            }
            const updated = snap.data() as AppUser;
            setAppUser(updated);
            if (updated.isBanned)
              await performLogout("User dynamically banned");
          },
          async () => await performLogout("Error listening to user document")
        );

        const token = await authClient.getIdToken();
        if (token) {
          await fetch("/api/auth/session", {
            method: "POST",
            body: JSON.stringify({ action: "login", token }),
          }).catch(() => {});
        }
      } catch (err) {
        console.error("Auth init error:", err);
        toast.error("Erreur lors de l'initialisation de la session.");
        await performLogout("Auth init error");
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearListeners();
    };
  }, [performLogout, clearListeners]);

  useEffect(() => {
    if (sessionDocListenerRef.current) sessionDocListenerRef.current();

    if (currentSessionId && appUser && firebaseUser) {
      sessionDocListenerRef.current = onSnapshot(
        doc(db, "sessions", currentSessionId),
        async (snap) => {
          if (!snap.exists()) {
            await performLogout("Session document deleted remotely");
            return;
          }
          const session = snap.data() as Session;
          if (session.uid !== appUser.uid) {
            await performLogout("Session UID mismatch");
            return;
          }
          if (session.revoked) {
            await performLogout("Session revoked remotely");
            return;
          }
          if (session.expiresAt?.toDate().getTime() < Date.now()) {
            await performLogout("Session expired");
          }
        },
        async () => await performLogout("Error listening to session document")
      );
    }

    return () => sessionDocListenerRef.current?.();
  }, [currentSessionId, appUser, firebaseUser, performLogout]);

  if (!loading && firebaseUser && !appUser) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
        <p className="mb-4 text-lg font-semibold">
          Profil utilisateur introuvable.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Veuillez contacter le support, réessayer plus tard ou vous déconnecter
          ci-dessous.
        </p>
        <button
          className="rounded bg-primary px-4 py-2 text-white"
          onClick={() => performLogout("Manual logout from fallback")}
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        loading,
        currentSessionId,
        logout: (reason?: string) =>
          performLogout(reason || "Manual user logout"),
        setSessionDetails: setSessionDetailsAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
