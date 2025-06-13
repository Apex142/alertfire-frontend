// src/services/AuthService.ts

import { AuthProviderFactory } from "@/lib/factories/AuthProviderFactory";
import { auth } from "@/lib/firebase/client";
import { IUserRepository } from "@/repositories/IUserRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { sessionService } from "@/services/SessionService"; // <--- Le service gérant les sessions
import { Session } from "@/types/entities/Session";
import { User } from "@/types/entities/User";
import { AuthProviderType } from "@/types/enums/AuthProvider";
import { GlobalRole } from "@/types/enums/GlobalRole";
import {
  User as FirebaseUser,
  UserCredential,
  createUserWithEmailAndPassword,
  deleteUser as firebaseDeleteUser,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Timestamp, serverTimestamp } from "firebase/firestore";

export interface AuthResult {
  userCredential: UserCredential;
  appUser: User | null;
  session: Session | null;
}

export class AuthService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  private async handleUserDocumentUpsert(
    firebaseUser: FirebaseUser,
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
    if (!firebaseUser) return null;

    let appUser = await this.userRepository.findById(firebaseUser.uid);
    const now = serverTimestamp() as Timestamp;

    if (!appUser) {
      const newUserProfileData: Omit<User, "uid" | "createdAt" | "updatedAt"> =
        {
          email: firebaseUser.email || "",
          displayName:
            additionalData.displayName ||
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Nouvel utilisateur",
          photoURL: firebaseUser.photoURL || null,
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
      appUser = await this.userRepository.create(
        newUserProfileData as Omit<User, "uid">,
        firebaseUser.uid
      );
    } else {
      const updates: Partial<User> = {
        lastLogin: now,
        updatedAt: now,
        ...(firebaseUser.photoURL &&
          firebaseUser.photoURL !== appUser.photoURL && {
            photoURL: firebaseUser.photoURL,
          }),
        ...(firebaseUser.displayName &&
          firebaseUser.displayName !== appUser.displayName && {
            displayName: firebaseUser.displayName,
          }),
      };
      if (Object.keys(updates).length > 0) {
        appUser = await this.userRepository.update(firebaseUser.uid, updates);
      }
    }
    return appUser;
  }

  async signInWithProvider(
    providerType: AuthProviderType
  ): Promise<AuthResult> {
    const strategy = AuthProviderFactory.create(providerType);
    const provider = strategy.getProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const appUser = await this.handleUserDocumentUpsert(userCredential.user);
      // Récup device/userAgent côté client
      const device =
        typeof window !== "undefined" ? navigator.userAgent : "unknown_device";
      const session = await sessionService.createSession({
        uid: userCredential.user.uid,
        device,
      });
      return { userCredential, appUser, session };
    } catch (error) {
      console.error(`Error signing in with ${providerType}:`, error);
      throw error;
    }
  }

  async signInUser(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const appUser = await this.handleUserDocumentUpsert(userCredential.user);
      const device =
        typeof window !== "undefined" ? navigator.userAgent : "unknown_device";
      const session = await sessionService.createSession({
        uid: userCredential.user.uid,
        device,
      });
      return { userCredential, appUser, session };
    } catch (error) {
      console.error("Error signing in with email/password:", error);
      throw error;
    }
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
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const displayName = `${additionalData.firstName || ""} ${
        additionalData.lastName || ""
      }`.trim();

      if (displayName) {
        await firebaseUpdateProfile(userCredential.user, { displayName });
      }

      const appUser = await this.handleUserDocumentUpsert(userCredential.user, {
        displayName: displayName || undefined,
        ...additionalData,
      });
      const device =
        typeof window !== "undefined" ? navigator.userAgent : "unknown_device";
      const session = await sessionService.createSession({
        uid: userCredential.user.uid,
        device,
      });
      return { userCredential, appUser, session };
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  async getAppUserProfile(uid: string): Promise<User | null> {
    try {
      const userProfile = await this.userRepository.findById(uid);
      return userProfile;
    } catch (error) {
      console.error("Error fetching app user profile in AuthService:", error);
      return null;
    }
  }

  async signOutUser(currentSessionId?: string): Promise<void> {
    try {
      console.log("Signing out user...");
      console.log("Current session ID:", currentSessionId);
      if (currentSessionId) {
        await sessionService.revokeSession(currentSessionId);
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  async signOutAllDevices(uid: string): Promise<void> {
    try {
      await sessionService.revokeAllSessions(uid);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out all devices:", error);
      throw error;
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
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
    return this.userRepository.update(userId, {
      ...updatableData,
      updatedAt: serverTimestamp() as Timestamp,
    });
  }

  async deleteCurrentUserAccount(currentSessionId?: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Aucun utilisateur n'est actuellement connecté.");
    }
    try {
      if (currentSessionId) {
        await sessionService.revokeSession(currentSessionId);
      }
      await this.userRepository.delete(currentUser.uid);
      await firebaseDeleteUser(currentUser);
    } catch (error) {
      if ((error as any).code === "auth/requires-recent-login") {
        throw new Error(
          "Cette opération nécessite une ré-authentification récente. Veuillez vous reconnecter et réessayer."
        );
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
