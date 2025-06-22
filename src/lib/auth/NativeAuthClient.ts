import {
  User as CapacitorUser,
  FirebaseAuthentication,
} from "@capacitor-firebase/authentication";
import { Capacitor } from "@capacitor/core";
import { AnyFirebaseUser, IAuthClient } from "./IAuthClient";

export class NativeAuthClient implements IAuthClient {
  private _currentUser: AnyFirebaseUser = null;

  constructor() {
    if (!Capacitor.isNativePlatform()) return; // Évite les erreurs côté web

    FirebaseAuthentication.getCurrentUser()
      .then(({ user }) => {
        this._currentUser = user ?? null;
      })
      .catch(() => {
        /* ignore */
      });
  }

  addAuthListener(cb: (u: AnyFirebaseUser) => void): () => void {
    if (!Capacitor.isNativePlatform()) return () => {};

    const wrapper = ({ user }: { user: CapacitorUser | null }) => {
      this._currentUser = user ?? null;
      cb(this._currentUser);
    };

    if (
      "addAuthStateChangeListener" in FirebaseAuthentication &&
      typeof (
        FirebaseAuthentication as {
          addAuthStateChangeListener?: (
            callback: (event: { user: CapacitorUser | null }) => void
          ) => { remove: () => void };
        }
      ).addAuthStateChangeListener === "function"
    ) {
      const sub = (
        FirebaseAuthentication as {
          addAuthStateChangeListener: (
            callback: (event: { user: CapacitorUser | null }) => void
          ) => { remove: () => void };
        }
      ).addAuthStateChangeListener(wrapper);
      return () => sub.remove();
    }

    const listenerPromise = FirebaseAuthentication.addListener(
      "authStateChange",
      wrapper
    );
    let removed = false;
    return async () => {
      if (!removed) {
        const listener = await listenerPromise;
        listener.remove();
        removed = true;
      }
    };
  }

  async signOut(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    await FirebaseAuthentication.signOut();
    this._currentUser = null;
  }

  async getIdToken(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) return null;
    const { token } = await FirebaseAuthentication.getIdToken();
    return token ?? null;
  }

  currentUser(): AnyFirebaseUser {
    return this._currentUser;
  }
}
