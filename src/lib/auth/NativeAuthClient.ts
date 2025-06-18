import {
  User as CapacitorUser,
  FirebaseAuthentication,
} from "@capacitor-firebase/authentication";
import { AnyFirebaseUser, IAuthClient } from "./IAuthClient";

export class NativeAuthClient implements IAuthClient {
  /** Cache local (toujours mis à jour par les listeners) */
  private _currentUser: AnyFirebaseUser = null;

  constructor() {
    /* Initialise la valeur dès le démarrage de l’appli */
    FirebaseAuthentication.getCurrentUser()
      .then(({ user }) => {
        this._currentUser = user ?? null;
      })
      .catch(() => {
        /* ignore – restera à null */
      });
  }

  /** Enregistre un callback à chaque changement d’état ; renvoie la fonction de désinscription */
  addAuthListener(cb: (u: AnyFirebaseUser) => void): () => void {
    const wrapper = ({ user }: { user: CapacitorUser | null }) => {
      this._currentUser = user ?? null;
      cb(this._currentUser);
    };

    /* ① API ≥ 5.1 -------------------------------------------- */
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

    /* ② Ancienne API (“authStateChange” event) ---------------- */
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

  /** Logout natif */
  async signOut(): Promise<void> {
    await FirebaseAuthentication.signOut();
    this._currentUser = null;
  }

  /** ID-token JWT pour tes appels serveur sécurisés */
  async getIdToken(): Promise<string | null> {
    const { token } = await FirebaseAuthentication.getIdToken();
    return token ?? null;
  }

  /** Utilisateur courant (synchrone grâce au cache local) */
  currentUser(): AnyFirebaseUser {
    return this._currentUser;
  }
}
