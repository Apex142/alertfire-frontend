// pkg/lib/auth/IAuthClient.ts
import type { User as CapacitorUser } from "@capacitor-firebase/authentication";
import type { User as WebUser } from "firebase/auth";

export type AnyFirebaseUser = CapacitorUser | WebUser | null;

export interface IAuthClient {
  /** Reçoit un callback à appeler à chaque changement d’état */
  addAuthListener(cb: (u: AnyFirebaseUser) => void): () => void;

  /** Logout complet de la plateforme */
  signOut(): Promise<void>;

  /** Récupère l’ID-token JWT Firebase pour les appels serveur */
  getIdToken(): Promise<string | null>;

  /** Renvoie l’utilisateur courant si déjà connecté */
  currentUser(): AnyFirebaseUser;
}
