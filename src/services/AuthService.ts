/* -------------------------------------------------------------------------- */
/*  ⚠️  FICHIER CLIENT-ONLY : NE PAS L’importer dans un composant serveur     */
/*      Pas de "use client" – on l’instancie via createAuthService()         */
/* -------------------------------------------------------------------------- */

import { Timestamp, serverTimestamp } from "firebase/firestore";

import type { IUserRepository } from "@/repositories/IUserRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { sessionService } from "@/services/SessionService";
import type { Session } from "@/types/entities/Session";
import type { User as AppUser } from "@/types/entities/User";
import { AuthProviderType } from "@/types/enums/AuthProvider";
import { GlobalRole } from "@/types/enums/GlobalRole";
import type { SignInResult } from "@capacitor-firebase/authentication";

/* -------------------------------------------------------------------------- */
/* Types Firebase Capacitor                                                   */
/* -------------------------------------------------------------------------- */
type CapacitorUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoUrl?: string | null;
};

export interface AuthResult {
  userCredential: SignInResult;
  appUser: AppUser | null;
  session: Session | null;
}

/* -------------------------------------------------------------------------- */
/* Helper : import dynamique du plugin natif                                  */
/* -------------------------------------------------------------------------- */
async function loadNativeAuth() {
  const mod = await import("@capacitor-firebase/authentication");
  return mod.FirebaseAuthentication;
}

/* -------------------------------------------------------------------------- */
/* Classe principale                                                          */
/* -------------------------------------------------------------------------- */
export class AuthService {
  constructor(private userRepository: IUserRepository = new UserRepository()) {}

  /* ------------ 1. Création / mise à jour du document utilisateur ---------- */
  private async upsertUserDocument(
    firebaseUser: CapacitorUser | null,
    additional: Partial<
      Omit<
        AppUser,
        | "uid"
        | "createdAt"
        | "updatedAt"
        | "lastLogin"
        | "globalRole"
        | "onboardingStep"
        | "onboardingCompleted"
        | "preferences"
      >
    > = {}
  ): Promise<AppUser | null> {
    if (!firebaseUser?.uid) return null;

    let user = await this.userRepository.findById(firebaseUser.uid);
    const now = serverTimestamp() as Timestamp;

    if (!user) {
      user = await this.createDefaultProfile(firebaseUser, additional);
    } else {
      const updates: Partial<AppUser> = {
        lastLogin: now,
        updatedAt: now,
        ...(firebaseUser.displayName &&
          firebaseUser.displayName !== user.displayName && {
            displayName: firebaseUser.displayName,
          }),
        ...(firebaseUser.photoUrl &&
          firebaseUser.photoUrl !== user.photoURL && {
            photoURL: firebaseUser.photoUrl,
          }),
      };

      if (Object.keys(updates).length) {
        user = await this.userRepository.update(firebaseUser.uid, updates);
      }
    }
    return user;
  }

  /* ------------ 2. Profil par défaut (appelé par upsert) ------------------- */
  async createDefaultProfile(
    firebaseUser: CapacitorUser,
    additional: Partial<AppUser> = {}
  ): Promise<AppUser> {
    const now = serverTimestamp() as Timestamp;

    const newUser: Omit<AppUser, "uid" | "createdAt" | "updatedAt"> = {
      email: firebaseUser.email || "",
      displayName:
        additional.displayName ||
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "Nouvel utilisateur",
      photoURL: firebaseUser.photoUrl || null,
      firstName: additional.firstName || "",
      lastName: additional.lastName || "",
      globalRole: [GlobalRole.USER],
      onboardingStep: 1,
      onboardingCompleted: false,
      preferences: { theme: "light", language: "fr", notifications: true },
      lastLogin: now,
      fullAddress: additional.fullAddress || "",
      legalStatus: additional.legalStatus || "",
      phone: additional.phone || "",
      position: additional.position || "",
      intent: additional.intent || "",
      companies: additional.companies || [],
      companySelected: additional.companySelected || null,
      favoriteLocationIds: additional.favoriteLocationIds || [],
    };

    return await this.userRepository.create(newUser, firebaseUser.uid);
  }

  /* ---------------- 3. Authentification (Google, email) -------------------- */
  async signInWithProvider(provider: AuthProviderType): Promise<AuthResult> {
    const FirebaseAuthentication = await loadNativeAuth();

    let result: SignInResult;
    switch (provider) {
      case AuthProviderType.GOOGLE:
        result = await FirebaseAuthentication.signInWithGoogle();
        break;
      default:
        throw new Error(`Provider ${provider} non supporté.`);
    }

    const firebaseUser = result.user!;
    const appUser = await this.upsertUserDocument(firebaseUser);
    const device =
      typeof window !== "undefined" ? navigator.userAgent : "unknown_device";

    const session = await sessionService.createSession({
      uid: firebaseUser.uid,
      device,
    });

    return { userCredential: result, appUser, session };
  }

  async signInUser(email: string, password: string): Promise<AuthResult> {
    const FirebaseAuthentication = await loadNativeAuth();
    const result = await FirebaseAuthentication.signInWithEmailAndPassword({
      email,
      password,
    });

    const firebaseUser = result.user!;
    const appUser = await this.upsertUserDocument(firebaseUser);
    const device =
      typeof window !== "undefined" ? navigator.userAgent : "unknown_device";

    const session = await sessionService.createSession({
      uid: firebaseUser.uid,
      device,
    });

    return { userCredential: result, appUser, session };
  }

  async signUpUser(
    email: string,
    password: string,
    additional: Partial<
      Omit<
        AppUser,
        | "uid"
        | "createdAt"
        | "updatedAt"
        | "lastLogin"
        | "globalRole"
        | "onboardingStep"
        | "onboardingCompleted"
        | "preferences"
        | "email"
        | "photoURL"
      >
    > = {}
  ): Promise<AuthResult> {
    const FirebaseAuthentication = await loadNativeAuth();
    const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
      email,
      password,
    });

    const firebaseUser = result.user!;
    const displayName = `${additional.firstName || ""} ${
      additional.lastName || ""
    }`.trim();
    if (displayName) {
      await FirebaseAuthentication.updateProfile({ displayName });
    }

    const appUser = await this.upsertUserDocument(firebaseUser, {
      displayName: displayName || undefined,
      ...additional,
    });

    const device =
      typeof window !== "undefined" ? navigator.userAgent : "unknown_device";

    const session = await sessionService.createSession({
      uid: firebaseUser.uid,
      device,
    });

    return { userCredential: result, appUser, session };
  }

  /* ---------------- 4. Déconnexion / Reset / Multi-devices ----------------- */
  async signOutUser(sessionId?: string) {
    const FirebaseAuthentication = await loadNativeAuth();
    if (sessionId) await sessionService.revokeSession(sessionId);
    await FirebaseAuthentication.signOut();
  }

  async signOutAllDevices(uid: string) {
    const FirebaseAuthentication = await loadNativeAuth();
    await sessionService.revokeAllSessions(uid);
    await FirebaseAuthentication.signOut();
  }

  async sendPasswordReset(email: string) {
    const FirebaseAuthentication = await loadNativeAuth();
    await FirebaseAuthentication.sendPasswordResetEmail({ email });
  }

  /* ---------------- 5. Profil utils --------------------------------------- */
  getAppUserProfile(uid: string) {
    return this.userRepository.findById(uid);
  }

  updateUserProfileData(userId: string, data: Partial<AppUser>) {
    return this.userRepository.update(userId, {
      ...data,
      updatedAt: serverTimestamp() as Timestamp,
    });
  }

  async deleteCurrentUserAccount(sessionId?: string) {
    const FirebaseAuthentication = await loadNativeAuth();
    const { user } = await FirebaseAuthentication.getCurrentUser();
    if (!user) throw new Error("Aucun utilisateur connecté.");

    if (sessionId) await sessionService.revokeSession(sessionId);
    await this.userRepository.delete(user.uid);
    await FirebaseAuthentication.deleteUser();
  }
}

/* -------------------------------------------------------------------------- */
/* Factory : instance unique, null côté serveur                               */
/* -------------------------------------------------------------------------- */
let _instance: AuthService | null = null;

export async function createAuthService(): Promise<AuthService | null> {
  if (typeof window === "undefined") return null;
  if (!_instance) _instance = new AuthService();
  return _instance;
}
