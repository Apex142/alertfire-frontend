// src/lib/auth/WebAuthClient.ts
import {
  signOut as firebaseSignOut,
  getAuth,
  onAuthStateChanged,
  User as WebUser,
} from "firebase/auth";

import { AnyFirebaseUser, IAuthClient } from "./IAuthClient";

export class WebAuthClient implements IAuthClient {
  /** Instance Auth liée à l’app Firebase déjà initialisée (voir client.ts) */
  private auth = getAuth();

  /** Cache local de l’utilisateur courant */
  private _currentUser: WebUser | null = this.auth.currentUser ?? null;

  /** Enregistre un listener et renvoie la fonction de désinscription */
  addAuthListener(cb: (u: AnyFirebaseUser) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => {
      this._currentUser = user;
      cb(user ?? null);
    });
  }

  /** Déconnexion Web */
  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
    this._currentUser = null;
  }

  /** Récupère le JWT Firebase (null si non connecté) */
  async getIdToken(): Promise<string | null> {
    return this._currentUser ? this._currentUser.getIdToken() : null;
  }

  /** Utilisateur courant (synchrone) */
  currentUser(): AnyFirebaseUser {
    return this._currentUser;
  }
}
