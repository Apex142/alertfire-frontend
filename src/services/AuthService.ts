/* -------------------------------------------------------------------------- */
/*  ⚠️  FICHIER CLIENT-ONLY : NE PAS importer côté serveur                    */
/* -------------------------------------------------------------------------- */

import { Capacitor } from "@capacitor/core";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail as webSendReset,
  signOut as webSignOut,
  User as WebUser,
} from "firebase/auth";
import { serverTimestamp, Timestamp } from "firebase/firestore";

import type { IUserRepository } from "@/repositories/IUserRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { sessionService } from "@/services/SessionService";
import type { Session } from "@/types/entities/Session";
import type { User as AppUser } from "@/types/entities/User";
import { AuthProviderType } from "@/types/enums/AuthProvider";
import { GlobalRole } from "@/types/enums/GlobalRole";
import type { SignInResult } from "@capacitor-firebase/authentication";

/* -------------------------------------------------------------------------- */
/* Helper natif : charge le plugin uniquement sur MOBILE                      */
/* -------------------------------------------------------------------------- */
const isNative = Capacitor.isNativePlatform();
let Native: typeof import("@capacitor-firebase/authentication").FirebaseAuthentication;

async function loadNative() {
  if (!isNative) return;
  if (!Native) {
    const mod = await import("@capacitor-firebase/authentication");
    Native = mod.FirebaseAuthentication;
  }
}

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */
type CapacitorUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoUrl?: string | null;
};
type AnyFBUser = WebUser | CapacitorUser;

export interface AuthResult {
  userCredential: SignInResult | { user: WebUser };
  appUser: AppUser | null;
  session: Session | null;
}

/* -------------------------------------------------------------------------- */
/* Classe                                                                      */
/* -------------------------------------------------------------------------- */
export class AuthService {
  private repo: IUserRepository;
  private webAuth = getAuth();

  constructor(repo: IUserRepository = new UserRepository()) {
    this.repo = repo;
  }

  /* ---------- 1. Upsert utilisateur Firestore ---------------------------- */
  private async upsert(
    fbUser: AnyFBUser,
    extra: Partial<AppUser> = {}
  ): Promise<AppUser> {
    const now = serverTimestamp() as Timestamp;
    let user = await this.repo.findById(fbUser.uid);

    const base = {
      email: "email" in fbUser ? fbUser.email ?? "" : "",
      displayName:
        ("displayName" in fbUser ? fbUser.displayName : "") ||
        extra.displayName ||
        "",
      photoURL:
        "photoUrl" in fbUser ? fbUser.photoUrl ?? null : fbUser.photoURL,
      lastLogin: now,
      ...extra,
    };

    if (!user) {
      user = await this.repo.create(
        {
          ...base,
          globalRole: [GlobalRole.USER],
          onboardingStep: 1,
          onboardingCompleted: false,
          preferences: { theme: "light", language: "fr", notifications: true },
        },
        fbUser.uid
      );
    } else {
      user = await this.repo.update(fbUser.uid, { ...base, updatedAt: now });
    }
    return user;
  }

  /* ---------- 2. Factorisation post-login -------------------------------- */
  private async afterLogin(
    fbUser: AnyFBUser,
    cred: SignInResult | { user: WebUser }
  ): Promise<AuthResult> {
    const appUser = await this.upsert(fbUser);
    const device =
      typeof window !== "undefined" ? navigator.userAgent : "unknown_device";
    const session = await sessionService.createSession({
      uid: fbUser.uid,
      device,
    });
    return { userCredential: cred, appUser, session };
  }

  /* ---------- 3. Auth – Google provider ---------------------------------- */
  async signInWithProvider(provider: AuthProviderType): Promise<AuthResult> {
    if (provider !== AuthProviderType.GOOGLE)
      throw new Error(`Provider ${provider} non supporté`);

    if (isNative) {
      await loadNative();
      const res = await Native.signInWithGoogle();
      return this.afterLogin(res.user!, res);
    }

    const { user } = await signInWithPopup(
      this.webAuth,
      new GoogleAuthProvider()
    );
    return this.afterLogin(user, { user });
  }

  /* ---------- 4. Auth – email / password --------------------------------- */
  async signInUser(email: string, password: string): Promise<AuthResult> {
    if (isNative) {
      await loadNative();
      const res = await Native.signInWithEmailAndPassword({ email, password });
      return this.afterLogin(res.user!, res);
    }
    const { user } = await signInWithEmailAndPassword(
      this.webAuth,
      email,
      password
    );
    return this.afterLogin(user, { user });
  }

  async signUpUser(
    email: string,
    password: string,
    extra: Partial<AppUser> = {}
  ): Promise<AuthResult> {
    if (isNative) {
      await loadNative();
      const res = await Native.createUserWithEmailAndPassword({
        email,
        password,
      });
      const dn = `${extra.firstName ?? ""} ${extra.lastName ?? ""}`.trim();
      if (dn) await Native.updateProfile({ displayName: dn });
      return this.afterLogin(res.user!, res);
    }

    const { user } = await createUserWithEmailAndPassword(
      this.webAuth,
      email,
      password
    );
    const dn = `${extra.firstName ?? ""} ${extra.lastName ?? ""}`.trim();
    if (dn) await updateProfile(user, { displayName: dn });
    return this.afterLogin(user, { user });
  }

  /* ---------- 5. Déconnexion & reset ------------------------------------- */
  async signOutUser(sessionId?: string) {
    if (sessionId) await sessionService.revokeSession(sessionId);
    if (isNative) {
      await loadNative();
      return Native.signOut();
    }
    return webSignOut(this.webAuth);
  }

  async signOutAllDevices(uid: string) {
    await sessionService.revokeAllSessions(uid);
    if (isNative) {
      await loadNative();
      return Native.signOut();
    }
    return webSignOut(this.webAuth);
  }

  async sendPasswordReset(email: string) {
    if (isNative) {
      await loadNative();
      return Native.sendPasswordResetEmail({ email });
    }
    return webSendReset(this.webAuth, email);
  }

  /* ---------- 6. Profil utils -------------------------------------------- */
  getAppUserProfile(uid: string) {
    return this.repo.findById(uid);
  }

  updateUserProfileData(userId: string, data: Partial<AppUser>) {
    return this.repo.update(userId, {
      ...data,
      updatedAt: serverTimestamp() as Timestamp,
    });
  }

  async deleteCurrentUserAccount(sessionId?: string) {
    if (isNative) {
      await loadNative();
      const { user } = await Native.getCurrentUser();
      if (!user) throw new Error("Aucun utilisateur connecté.");
      if (sessionId) await sessionService.revokeSession(sessionId);
      await this.repo.delete(user.uid);
      return Native.deleteUser();
    }

    const user = this.webAuth.currentUser;
    if (!user) throw new Error("Aucun utilisateur connecté.");
    if (sessionId) await sessionService.revokeSession(sessionId);
    await this.repo.delete(user.uid);
    return user.delete();
  }
}

/* ---------- 7. Factory unique ------------------------------------------- */
let _instance: AuthService | null = null;
export async function createAuthService(): Promise<AuthService | null> {
  if (typeof window === "undefined") return null;
  if (!_instance) _instance = new AuthService();
  return _instance;
}
