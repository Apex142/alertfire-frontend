// pkg/lib/auth/WebAuthClient.ts
import {
  getAuth,
  onAuthStateChanged,
  signOut as webSignOut,
} from "firebase/auth";
import { app } from "../firebase/client";
import { AnyFirebaseUser, IAuthClient } from "./IAuthClient";

export class WebAuthClient implements IAuthClient {
  private auth = getAuth(app);

  addAuthListener(cb: (u: AnyFirebaseUser) => void) {
    return onAuthStateChanged(this.auth, cb);
  }

  async signOut() {
    await webSignOut(this.auth);
  }

  async getIdToken() {
    const u = this.auth.currentUser;
    return u ? u.getIdToken() : null;
  }

  currentUser() {
    return this.auth.currentUser;
  }
}
