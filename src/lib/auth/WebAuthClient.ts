import {
  signOut as firebaseSignOut,
  getAuth,
  onAuthStateChanged,
  User as WebUser,
} from "firebase/auth";

import { AnyFirebaseUser, IAuthClient } from "./IAuthClient";

export class WebAuthClient implements IAuthClient {
  private auth = getAuth();
  private _currentUser: WebUser | null = this.auth.currentUser ?? null;

  addAuthListener(cb: (u: AnyFirebaseUser) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => {
      this._currentUser = user;
      cb(user ?? null);
    });
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
    this._currentUser = null;
  }

  async getIdToken(): Promise<string | null> {
    return this._currentUser ? this._currentUser.getIdToken() : null;
  }

  currentUser(): AnyFirebaseUser {
    return this._currentUser;
  }
}
