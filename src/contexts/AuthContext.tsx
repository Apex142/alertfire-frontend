// src/contexts/AuthContext.tsx
"use client";

import { auth, db } from "@/lib/firebase/client";
import { authService } from "@/services/AuthService";
import { Session } from "@/types/entities/Session";
import { User as AppUser } from "@/types/entities/User";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
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
// (Optionnel) Import du toast si tu veux notifier l'utilisateur
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const userDocListenerUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const sessionDocListenerUnsubscribeRef = useRef<Unsubscribe | null>(null);

  // --- Helper pour nettoyer tous les listeners firestore
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

  // --- Nettoyage complet de l'état utilisateur/session + déconnexion réelle
  const performLogout = useCallback(
    async (reason?: string) => {
      const logPrefix = "AuthContext: performLogout -";
      setLoading(true);
      clearListeners();

      try {
        // Pour debug & logs
        console.log(`${logPrefix} Called. Reason: ${reason || "No reason"}`);

        // (Optionnel) Notifie l'utilisateur selon la cause
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

        await fetch(`/api/session/${currentSessionId}/delete`, {
          method: "POST",
        });

        // Déconnexion côté Firestore/session (révoque token, clean session doc, etc)
        await authService.signOutUser(currentSessionId);

        // Déconnexion côté Firebase Auth (CRUCIAL pour onAuthStateChanged)
        await auth.signOut();

        // Purge côté serveur (cookie)
        await fetch("/api/auth/session", {
          method: "POST",
          body: JSON.stringify({ action: "logout" }),
        });

        // Le reset des états sera auto-géré par onAuthStateChanged
        // Juste pour garantir UX :
        setFirebaseUser(null);
        setAppUser(null);
        setCurrentSessionId(null);
      } catch (error) {
        console.error(`${logPrefix} Error during signOut:`, error);
        // Si crash, force le reset client
        setFirebaseUser(null);
        setAppUser(null);
        setCurrentSessionId(null);
      }
      setLoading(false);
    },
    [currentSessionId, clearListeners]
  );

  // --- Gestion du cycle d'authentification Firebase (connexion/déco)
  useEffect(() => {
    const unsubscribeOnAuthStateChanged = onAuthStateChanged(
      auth,
      async (fbUser) => {
        setLoading(true);
        clearListeners();

        if (!fbUser) {
          // User déco (ou jamais loggué)
          setFirebaseUser(null);
          setAppUser(null);
          setCurrentSessionId(null);
          // Met à jour le cookie serveur aussi
          fetch("/api/auth/session", {
            method: "POST",
            body: JSON.stringify({ action: "logout" }),
          }).catch(() => {});
          setLoading(false);
          return;
        }

        setFirebaseUser(fbUser);
        try {
          // Charge le profil AppUser
          const fetchedAppUser = await authService.getAppUserProfile(
            fbUser.uid
          );
          if (!fetchedAppUser) {
            await performLogout("User profile not found after Firebase auth");
            return;
          }
          setAppUser(fetchedAppUser);

          // Ban check
          if (fetchedAppUser.isBanned === true) {
            await performLogout("User is banned");
            return;
          }

          // Attache le listener sur doc user Firestore (live update ban, etc)
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
          await performLogout("Error processing app user profile");
          return;
        }

        // MAJ du cookie serveur (login/refresh)
        try {
          const idToken = await fbUser.getIdToken();
          fetch("/api/auth/session", {
            method: "POST",
            body: JSON.stringify({ action: "login", token: idToken }),
          }).catch(() => {});
        } catch {
          await performLogout("Failed to get ID token");
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

  // --- Listener Firestore pour la session en cours (expiration/révocation)
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
          if (sessionData.expiresAt.toDate().getTime() < Date.now()) {
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

  // --- Pour setSessionDetails depuis le login/signup
  const setSessionDetailsAction = (
    user: AppUser | null,
    session: Session | null
  ) => {
    setAppUser(user);
    setCurrentSessionId(session?.sessionId || null);
  };

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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
