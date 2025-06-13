"use client";

import { auth, db } from "@/lib/firebase/client";
import { authService } from "@/services/AuthService";
import { sessionService } from "@/services/SessionService";
import { Session } from "@/types/entities/Session";
import { User as AppUser } from "@/types/entities/User";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, Unsubscribe } from "firebase/firestore";
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

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  currentSessionId: string | null;
  logout: (reason?: string) => Promise<void>;
  setSessionDetails: (user: AppUser | null, session: Session | null) => void;
}

const defaultAuthContextValue: AuthContextType = {
  firebaseUser: null,
  appUser: null,
  loading: true,
  currentSessionId: null,
  logout: async (reason?: string) => {
    console.warn(
      "AuthContext: Logout called before AuthContext initialized. Reason:",
      reason
    );
  },
  setSessionDetails: (user, session) => {
    console.warn(
      "AuthContext: setSessionDetails called before AuthContext initialized. User:",
      user,
      "Session:",
      session
    );
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

const SESSION_ID_STORAGE_KEY = "currentSessionId";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);

  const userDocListenerUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const sessionDocListenerUnsubscribeRef = useRef<Unsubscribe | null>(null);

  // Chargement initial : relit le sessionId du storage au mount (sur F5 par ex)
  useEffect(() => {
    const persistedSessionId = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (persistedSessionId) {
      setCurrentSessionId(persistedSessionId);
      currentSessionIdRef.current = persistedSessionId;
    }
  }, []);

  // Sync ref et localStorage à chaque update
  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
    if (currentSessionId) {
      localStorage.setItem(SESSION_ID_STORAGE_KEY, currentSessionId);
    } else {
      localStorage.removeItem(SESSION_ID_STORAGE_KEY);
    }
  }, [currentSessionId]);

  const clearListeners = useCallback(() => {
    if (userDocListenerUnsubscribeRef.current) {
      userDocListenerUnsubscribeRef.current();
      userDocListenerUnsubscribeRef.current = null;
    }
    if (sessionDocListenerUnsubscribeRef.current) {
      sessionDocListenerUnsubscribeRef.current();
      sessionDocListenerUnsubscribeRef.current = null;
    }
  }, []);

  // --- LOGOUT ROBUSTE ---
  const performLogout = useCallback(
    async (reason?: string, forceSessionId?: string | null) => {
      const logPrefix = "AuthContext: performLogout -";
      setLoading(true);
      clearListeners();

      try {
        const sessionId = forceSessionId ?? currentSessionIdRef.current;
        console.log(`${logPrefix} Called. Reason: ${reason || "No reason"}`);
        console.log("Current session ID (from ref):", sessionId);

        if (typeof reason === "string") {
          if (reason.includes("expired") || reason.includes("revoked")) {
            toast.warning(
              "Votre session a expiré ou a été révoquée. Merci de vous reconnecter."
            );
          } else if (reason.includes("banned")) {
            toast.error("Votre compte a été banni.");
          } else if (reason !== "Manual user logout") {
            toast.info("Déconnexion: " + reason);
          }
        }

        if (sessionId) {
          await fetch(`/api/session/${sessionId}/delete`, {
            method: "POST",
          });
        }

        await authService.signOutUser(sessionId);
        await auth.signOut();

        await fetch("/api/auth/session", {
          method: "POST",
          body: JSON.stringify({ action: "logout" }),
        });

        setFirebaseUser(null);
        setAppUser(null);
        setCurrentSessionId(null);
        currentSessionIdRef.current = null;
        localStorage.removeItem(SESSION_ID_STORAGE_KEY);
      } catch (error) {
        console.error(`${logPrefix} Error during signOut:`, error);
        setFirebaseUser(null);
        setAppUser(null);
        setCurrentSessionId(null);
        currentSessionIdRef.current = null;
        localStorage.removeItem(SESSION_ID_STORAGE_KEY);
      }
      setLoading(false);
    },
    [clearListeners]
  );

  // --- AuthState listener (login/logout) ---
  useEffect(() => {
    const unsubscribeOnAuthStateChanged = onAuthStateChanged(
      auth,
      async (fbUser) => {
        setLoading(true);
        clearListeners();

        if (!fbUser) {
          setFirebaseUser(null);
          setAppUser(null);
          setCurrentSessionId(null);
          currentSessionIdRef.current = null;
          localStorage.removeItem(SESSION_ID_STORAGE_KEY);
          fetch("/api/auth/session", {
            method: "POST",
            body: JSON.stringify({ action: "logout" }),
          }).catch(() => {});
          setLoading(false);
          return;
        }

        setFirebaseUser(fbUser);

        try {
          // -------- GET USER PROFILE OR CREATE IT IF MISSING --------
          let fetchedAppUser = await authService.getAppUserProfile(fbUser.uid);
          if (!fetchedAppUser) {
            // Création automatique du profil utilisateur si inexistant
            const defaultProfile: AppUser = {
              uid: fbUser.uid,
              email: fbUser.email || "",
              displayName: fbUser.displayName || "",
              isBanned: false,
            };
            try {
              await setDoc(doc(db, "users", fbUser.uid), defaultProfile);
              fetchedAppUser = defaultProfile;
              toast.success("Profil utilisateur créé automatiquement.");
              console.log("Profil Firestore créé pour", fbUser.uid);
            } catch (err) {
              toast.error("Impossible de créer le profil utilisateur.");
              await performLogout("User profile not found and creation failed");
              setLoading(false);
              return;
            }
          }

          setAppUser(fetchedAppUser);

          if (fetchedAppUser.isBanned === true) {
            await performLogout("User is banned");
            setLoading(false);
            return;
          }

          // -------- RÉCUPÈRE LA DERNIÈRE SESSION ACTIVE (clé du bug corrigée ici) --------
          const sessions = await sessionService.getUserSessions(fbUser.uid);
          let activeSession: Session | null = null;
          if (sessions && sessions.length > 0) {
            // NE GARDE QUE LES NON REVOQUÉES
            const nonRevoked = sessions.filter((s) => !s.revoked);
            if (nonRevoked.length > 0) {
              activeSession = nonRevoked.sort(
                (a, b) =>
                  (b.createdAt?.toMillis?.() || 0) -
                  (a.createdAt?.toMillis?.() || 0)
              )[0];
            }
          }
          setSessionDetailsAction(fetchedAppUser, activeSession);

          // -------- LISTEN FOR LIVE CHANGES TO USER PROFILE --------
          userDocListenerUnsubscribeRef.current = onSnapshot(
            doc(db, "users", fbUser.uid),
            async (snapshot) => {
              if (!snapshot.exists()) {
                await performLogout("User document deleted from Firestore");
                return;
              }
              const updatedAppUser = snapshot.data() as AppUser;
              setAppUser(updatedAppUser);
              if (updatedAppUser.isBanned === true) {
                await performLogout("User dynamically banned");
              }
            },
            async () => {
              await performLogout("Error listening to user document");
            }
          );
        } catch (error) {
          toast.error("Erreur lors de la récupération du profil utilisateur.");
          await performLogout("Error processing app user profile");
          setLoading(false);
          return;
        }

        // -------- UPDATE SERVER SESSION COOKIE --------
        try {
          const idToken = await fbUser.getIdToken();
          fetch("/api/auth/session", {
            method: "POST",
            body: JSON.stringify({ action: "login", token: idToken }),
          }).catch(() => {});
        } catch {
          await performLogout("Failed to get ID token");
          setLoading(false);
          return;
        }

        setLoading(false);
      }
    );

    return () => {
      unsubscribeOnAuthStateChanged();
      clearListeners();
    };
  }, [performLogout, clearListeners]);

  // --- Listener Firestore pour la session en cours (expiration/révocation) ---
  useEffect(() => {
    if (sessionDocListenerUnsubscribeRef.current) {
      sessionDocListenerUnsubscribeRef.current();
      sessionDocListenerUnsubscribeRef.current = null;
    }

    if (currentSessionId && appUser && firebaseUser) {
      sessionDocListenerUnsubscribeRef.current = onSnapshot(
        doc(db, "sessions", currentSessionId),
        async (snapshot) => {
          if (auth.currentUser?.uid !== appUser.uid || !firebaseUser) {
            if (sessionDocListenerUnsubscribeRef.current)
              sessionDocListenerUnsubscribeRef.current();
            return;
          }
          if (!snapshot.exists()) {
            await performLogout("Session document deleted remotely");
            return;
          }
          const sessionData = snapshot.data() as Session;
          if (sessionData.uid !== appUser.uid) {
            await performLogout(
              `Session UID mismatch. AppUser UID: ${appUser.uid}, Session UID: ${sessionData.uid}`
            );
            return;
          }
          if (sessionData.revoked) {
            await performLogout("Session revoked remotely");
            return;
          }
          if (
            sessionData.expiresAt &&
            sessionData.expiresAt.toDate().getTime() < Date.now()
          ) {
            await performLogout("Session expired based on expiresAt field");
            return;
          }
        },
        async () => {
          await performLogout("Error listening to session document");
        }
      );
    }
    return () => {
      if (sessionDocListenerUnsubscribeRef.current) {
        sessionDocListenerUnsubscribeRef.current();
        sessionDocListenerUnsubscribeRef.current = null;
      }
    };
  }, [currentSessionId, appUser, firebaseUser, performLogout, clearListeners]);

  // --- setSessionDetails synchronise tout (user, state, ref, localStorage) ---
  const setSessionDetailsAction = (
    user: AppUser | null,
    session: Session | null
  ) => {
    setAppUser(user);
    setCurrentSessionId(session?.sessionId || null);
    currentSessionIdRef.current = session?.sessionId || null;
    if (session?.sessionId) {
      localStorage.setItem(SESSION_ID_STORAGE_KEY, session.sessionId);
    } else {
      localStorage.removeItem(SESSION_ID_STORAGE_KEY);
    }
  };

  // -------- Fallback UI : utilisateur connecté à Firebase mais pas de profil Firestore --------
  if (!loading && firebaseUser && !appUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <p className="mb-4 text-lg font-semibold">
          Profil utilisateur introuvable.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Veuillez contacter le support, réessayer plus tard, ou vous
          déconnecter ci-dessous.
        </p>
        <button
          className="px-4 py-2 bg-primary text-white rounded"
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
          performLogout(
            reason || "Manual user logout",
            currentSessionIdRef.current
          ),
        setSessionDetails: setSessionDetailsAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
