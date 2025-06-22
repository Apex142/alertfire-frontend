import type { User as CapacitorUser } from "@capacitor-firebase/authentication";
import type { User as WebUser } from "firebase/auth";

export type AnyFirebaseUser = CapacitorUser | WebUser | null;

export interface IAuthClient {
  addAuthListener(cb: (u: AnyFirebaseUser) => void): () => void;
  signOut(): Promise<void>;
  getIdToken(): Promise<string | null>;
  currentUser(): AnyFirebaseUser;
}
