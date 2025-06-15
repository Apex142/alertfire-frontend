// src/services/AuthService.ts
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Timestamp, serverTimestamp } from "firebase/firestore";

import type { IUserRepository } from "@/repositories/IUserRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { sessionService } from "@/services/SessionService";
import type { Session } from "@/types/entities/Session";
import type { User } from "@/types/entities/User";
import { AuthProviderType } from "@/types/enums/AuthProvider";
import { GlobalRole } from "@/types/enums/GlobalRole";

type CapacitorUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoUrl?: string | null;
};

export interface AuthResult {
  userCredential: any;
  appUser: User | null;
  session: Session | null;
}

export class AuthService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  private async upsertUserDocument(
    firebaseUser: CapacitorUser,
    additionalData: Partial<
      Omit<
        User,
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
  ): Promise<User | null> {
    if (!firebaseUser || !firebaseUser.uid) return null;

    let user = await this.userRepository.findById(firebaseUser.uid);
    const now = serverTimestamp() as Timestamp;

    if (!user) {
      const newUser: Omit<User, "uid" | "createdAt" | "updatedAt"> = {
        email: firebaseUser.email || "",
        displayName:
          additionalData.displayName ||
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "Nouvel utilisateur",
        photoURL: firebaseUser.photoUrl || null,
        firstName: additionalData.firstName || "",
        lastName: additionalData.lastName || "",
        globalRole: GlobalRole.USER,
        onboardingStep: 1,
        onboardingCompleted: false,
        preferences: {
          theme: "light",
          language: "fr",
          notifications: true,
          ...additionalData.preferences,
        },
        lastLogin: now,
        fullAddress: additionalData.fullAddress || "",
        legalStatus: additionalData.legalStatus || "",
        phone: additionalData.phone || "",
        position: additionalData.position || "",
        intent: additionalData.intent || "",
        companies: additionalData.companies || [],
        companySelected: additionalData.companySelected || null,
        favoriteLocationIds: additionalData.favoriteLocationIds || [],
      };

      user = await this.userRepository.create(newUser, firebaseUser.uid);
    } else {
      const updates: Partial<User> = {
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
      if (Object.keys(updates).length > 0) {
        user = await this.userRepository.update(firebaseUser.uid, updates);
      }
    }

    return user;
  }

  async createDefaultProfile(firebaseUser: CapacitorUser): Promise<User> {
    const user = await this.upsertUserDocument(firebaseUser);
    if (!user) throw new Error("Création du profil utilisateur échouée.");
    return user;
  }

  async signInWithProvider(
    providerType: AuthProviderType
  ): Promise<AuthResult> {
    let result;
    switch (providerType) {
      case AuthProviderType.GOOGLE:
        result = await FirebaseAuthentication.signInWithGoogle();
        break;
      default:
        throw new Error(`Provider ${providerType} non supporté.`);
    }

    const firebaseUser = result.user;
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
    const result = await FirebaseAuthentication.signInWithEmailAndPassword({
      email,
      password,
    });
    const firebaseUser = result.user;
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
    additionalData: Partial<
      Omit<
        User,
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
    const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
      email,
      password,
    });
    const firebaseUser = result.user;

    const displayName = `${additionalData.firstName || ""} ${
      additionalData.lastName || ""
    }`.trim();
    if (displayName) {
      await FirebaseAuthentication.updateProfile({ displayName });
    }

    const appUser = await this.upsertUserDocument(firebaseUser, {
      displayName: displayName || undefined,
      ...additionalData,
    });

    const device =
      typeof window !== "undefined" ? navigator.userAgent : "unknown_device";
    const session = await sessionService.createSession({
      uid: firebaseUser.uid,
      device,
    });

    return { userCredential: result, appUser, session };
  }

  async signOutUser(currentSessionId?: string): Promise<void> {
    try {
      if (currentSessionId) {
        await sessionService.revokeSession(currentSessionId);
      }
      await FirebaseAuthentication.signOut();
    } catch (err) {
      console.error("Erreur de déconnexion :", err);
      throw err;
    }
  }

  async signOutAllDevices(uid: string): Promise<void> {
    try {
      await sessionService.revokeAllSessions(uid);
      await FirebaseAuthentication.signOut();
    } catch (err) {
      console.error("Erreur lors de la déconnexion globale :", err);
      throw err;
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await FirebaseAuthentication.sendPasswordResetEmail({ email });
    } catch (err) {
      console.error(
        "Erreur lors de l'envoi du mail de réinitialisation :",
        err
      );
      throw err;
    }
  }

  async getAppUserProfile(uid: string): Promise<User | null> {
    try {
      return await this.userRepository.findById(uid);
    } catch (err) {
      console.error("Erreur lors de la récupération du profil :", err);
      return null;
    }
  }

  async updateUserProfileData(
    userId: string,
    data: Partial<User>
  ): Promise<User | null> {
    const { uid, email, globalRole, createdAt, lastLogin, ...updatableData } =
      data;
    if (Object.keys(updatableData).length === 0) {
      throw new Error("Aucune donnée à mettre à jour.");
    }

    if (updatableData.displayName) {
      await FirebaseAuthentication.updateProfile({
        displayName: updatableData.displayName,
      });
    }
    if (updatableData.photoURL) {
      await FirebaseAuthentication.updateProfile({
        photoUrl: updatableData.photoURL,
      });
    }

    return this.userRepository.update(userId, {
      ...updatableData,
      updatedAt: serverTimestamp() as Timestamp,
    });
  }

  async deleteCurrentUserAccount(currentSessionId?: string): Promise<void> {
    const { user } = await FirebaseAuthentication.getCurrentUser();
    if (!user) throw new Error("Aucun utilisateur connecté.");

    try {
      if (currentSessionId) {
        await sessionService.revokeSession(currentSessionId);
      }
      await this.userRepository.delete(user.uid);
      await FirebaseAuthentication.deleteUser();
    } catch (err: any) {
      if (err?.code === "auth/requires-recent-login") {
        throw new Error("Reconnectez-vous pour supprimer votre compte.");
      }
      throw err;
    }
  }
}

export const authService = new AuthService();
