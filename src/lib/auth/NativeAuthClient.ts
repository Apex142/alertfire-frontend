// src/lib/auth/NativeAuthClient.ts
import {
  User as CapacitorUser,
  FirebaseAuthentication,
} from "@capacitor-firebase/authentication";
import { AnyFirebaseUser, IAuthClient } from "./IAuthClient";

export class NativeAuthClient implements IAuthClient {
  /** Retourne une fonction de désinscription */
  addAuthListener(cb: (u: AnyFirebaseUser) => void) {
    /* ① Nouvel API (>= 5.1) -------------------------------------------- */
    if (
      "addAuthStateChangeListener" in FirebaseAuthentication &&
      typeof (FirebaseAuthentication as any).addAuthStateChangeListener ===
        "function"
    ) {
      // Typage un peu laxiste le temps que les DS Types soient mis à jour
      const sub = (FirebaseAuthentication as any).addAuthStateChangeListener(
        ({ user }: { user: CapacitorUser | null }) => cb(user ?? null)
      );
      return () => sub.remove();
    }

    /* ② Ancien fallback ("authStateChange" event) ----------------------- */
    const listener = FirebaseAuthentication.addListener(
      "authStateChange",
      ({ user }: { user: CapacitorUser | null }) => cb(user ?? null)
    );
    return () => listener.remove();
  }

  async signOut() {
    await FirebaseAuthentication.signOut();
  }

  async getIdToken(): Promise<string | null> {
    const { token } = await FirebaseAuthentication.getIdToken();
    return token ?? null;
  }

  currentUser() {
    return FirebaseAuthentication.getCurrentUser().then((r) => r.user);
  }
}
