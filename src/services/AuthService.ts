/* -------------------------------------------------------------------------- */
/*  AuthService – gestion unifiée Web + Capacitor (email, Google, sessions)   */
/* -------------------------------------------------------------------------- */

import type { SignInResult } from "@capacitor-firebase/authentication";
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

import type {
  CreateUserData,
  IUserRepository,
} from "@/repositories/IUserRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { sessionService } from "@/services/SessionService";
import type { Session } from "@/types/entities/Session";
import type { User as AppUser } from "@/types/entities/User";
import { AuthProviderType } from "@/types/enums/AuthProvider";

/* -------------------------------------------------------------------------- */
/*  Détection plate-forme & chargement du plugin natif                        */
/* -------------------------------------------------------------------------- */

const isNative = Capacitor.isNativePlatform();
let Native:
  | typeof import("@capacitor-firebase/authentication").FirebaseAuthentication
  | undefined;

async function loadNative() {
  if (!isNative || Native) return;
  const mod = await import("@capacitor-firebase/authentication");
  Native = mod.FirebaseAuthentication;
}

/* -------------------------------------------------------------------------- */
/*  Types utilitaires                                                         */
/* -------------------------------------------------------------------------- */

type CapacitorUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoUrl?: string | null;
};

export type AnyFirebaseUser = WebUser | CapacitorUser;

export interface AuthResult {
  userCredential: SignInResult | { user: WebUser };
  appUser: AppUser;
  session: Session;
}

/* -------------------------------------------------------------------------- */
/*  AuthService                                                               */
/* -------------------------------------------------------------------------- */
export class AuthService {
  private repo: IUserRepository;
  private webAuth = getAuth();

  constructor(repo: IUserRepository = new UserRepository()) {
    this.repo = repo;
  }

  /* ---------- 1. Upsert utilisateur Firestore ---------------------------- */
  private async upsertUser(
    fbUser: AnyFirebaseUser,
    extra: Partial<AppUser> = {}
  ): Promise<AppUser> {
    const now = serverTimestamp() as Timestamp;

    /* Base commun Web / Natif */
    const base = {
      email: "email" in fbUser ? fbUser.email ?? "" : "",
      displayName:
        ("displayName" in fbUser ? fbUser.displayName : "") ||
        extra.displayName ||
        "",
      photoURL:
        "photoUrl" in fbUser
          ? fbUser.photoUrl ?? null
          : (fbUser as { photoURL?: string | null }).photoURL ?? null,
      lastLogin: now,
    };

    /* 1️⃣  Lecture de l’utilisateur */
    let user = await this.repo.findById(fbUser.uid);

    if (!user) {
      /* 2️⃣  Création – on ne passe QUE les champs de CreateUserData       */
      const newUserData: CreateUserData = {
        email: base.email,
        displayName: base.displayName,
        photoURL: base.photoURL,
        companies: extra.companies, // facultatif
        companySelected: extra.companySelected, // facultatif
      };

      user = await this.repo.create(newUserData, fbUser.uid);
    } else {
      /* 3️⃣  Mise à jour légère                                           */
      user = await this.repo.update(fbUser.uid, {
        ...base,
        updatedAt: now,
      });
    }

    if (!user)
      throw new Error("Impossible de créer ou mettre à jour l’utilisateur.");
    return user;
  }

  /* ---------- 2. Hooks utilitaires post-login --------------------------- */
  private async afterLogin(
    fbUser: AnyFirebaseUser,
    cred: SignInResult | { user: WebUser }
  ): Promise<AuthResult> {
    const appUser = await this.upsertUser(fbUser);
    const device =
      typeof window !== "undefined" ? navigator.userAgent : "unknown_device";

    const session = await sessionService.createSession({
      uid: fbUser.uid,
      device,
    });
    return { userCredential: cred, appUser, session };
  }

  /* ---------- 3. Méthodes publiques ------------------------------------- */
  async signInWithProvider(provider: AuthProviderType): Promise<AuthResult> {
    if (provider !== AuthProviderType.GOOGLE)
      throw new Error(`Provider ${provider} non supporté`);

    if (isNative) {
      await loadNative();
      const res = await Native!.signInWithGoogle();
      if (!res.user) throw new Error("Échec de la connexion Google native.");
      return this.afterLogin(res.user, res);
    }

    const { user } = await signInWithPopup(
      this.webAuth,
      new GoogleAuthProvider()
    );
    return this.afterLogin(user, { user });
  }

  async signInUser(email: string, password: string): Promise<AuthResult> {
    if (isNative) {
      await loadNative();
      const res = await Native!.signInWithEmailAndPassword({ email, password });
      if (!res.user)
        throw new Error("Échec de la connexion par email (natif).");
      return this.afterLogin(res.user, res);
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
      const res = await Native!.createUserWithEmailAndPassword({
        email,
        password,
      });
      const dn = `${extra.firstName ?? ""} ${extra.lastName ?? ""}`.trim();
      if (dn) await Native!.updateProfile({ displayName: dn });
      if (!res.user) throw new Error("Échec de l’inscription native.");
      return this.afterLogin(res.user, res);
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

  async signOutUser(sessionId?: string) {
    if (sessionId) await sessionService.revokeSession(sessionId);

    if (isNative) {
      await loadNative();
      return Native!.signOut();
    }
    return webSignOut(this.webAuth);
  }

  async signOutAllDevices(uid: string) {
    await sessionService.revokeAllSessions(uid);

    if (isNative) {
      await loadNative();
      return Native!.signOut();
    }
    return webSignOut(this.webAuth);
  }

  async sendPasswordReset(email: string) {
    if (isNative) {
      await loadNative();
      return Native!.sendPasswordResetEmail({ email });
    }
    return webSendReset(this.webAuth, email);
  }

  /* ---------- 4. Gestion du profil utilisateur -------------------------- */
  getAppUserProfile(uid: string) {
    return this.repo.findById(uid);
  }

  async createUserProfile(
    fbUser: AnyFirebaseUser,
    extra: Partial<AppUser> = {}
  ) {
    return this.upsertUser(fbUser, extra);
  }

  updateUserProfileData(uid: string, data: Partial<AppUser>) {
    return this.repo.update(uid, {
      ...data,
      updatedAt: serverTimestamp() as Timestamp,
    });
  }

  async deleteCurrentUserAccount(sessionId?: string) {
    if (sessionId) await sessionService.revokeSession(sessionId);

    if (isNative) {
      await loadNative();
      const { user } = await Native!.getCurrentUser();
      if (!user) throw new Error("Aucun utilisateur connecté.");
      await this.repo.delete(user.uid);
      return Native!.deleteUser();
    }

    const user = this.webAuth.currentUser;
    if (!user) throw new Error("Aucun utilisateur connecté.");
    await this.repo.delete(user.uid);
    return user.delete();
  }
}

/* -------------------------------------------------------------------------- */
/*  Singleton (factory)                                                       */
/* -------------------------------------------------------------------------- */
let _instance: AuthService | null = null;

export async function createAuthService(): Promise<AuthService | null> {
  if (typeof window === "undefined") return null;
  if (!_instance) _instance = new AuthService();
  return _instance;
}
