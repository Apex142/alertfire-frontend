import { IUserRepository } from "@/repositories/IUserRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { sessionService } from "@/services/SessionService";
import { Session } from "@/types/entities/Session";
import { User } from "@/types/entities/User";
import { AuthProviderType } from "@/types/enums/AuthProvider";
import { GlobalRole } from "@/types/enums/GlobalRole";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Timestamp, serverTimestamp } from "firebase/firestore";

// User type = Capacitor user
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

  constructor() {
    this.userRepository = new UserRepository();
  }

  private async handleUserDocumentUpsert(
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
      appUser = await this.userRepository.create(
        newUserProfileData as Omit<User, "uid">,
        firebaseUser.uid
      );
    } else {
      const updates: Partial<User> = {
        lastLogin: now,
        updatedAt: now,
        ...(firebaseUser.photoUrl &&
          firebaseUser.photoUrl !== appUser.photoURL && {
            photoURL: firebaseUser.photoUrl,
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

  // Sign in with provider (exemple ici Google, tu peux étendre à Apple, Facebook, etc)
  async signInWithProvider(
    providerType: AuthProviderType
  ): Promise<AuthResult> {
    let result;
    switch (providerType) {
      case AuthProviderType.GOOGLE:
        result = await FirebaseAuthentication.signInWithGoogle();
        break;
      // case AuthProviderType.APPLE:
      //   result = await FirebaseAuthentication.signInWithApple();
      //   break;
      // Ajoute d'autres providers ici...
      default:
        throw new Error(`Provider ${providerType} non supporté.`);
    }
    const firebaseUser = result.user;
    const appUser = await this.handleUserDocumentUpsert(firebaseUser);
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
    const appUser = await this.handleUserDocumentUpsert(firebaseUser);
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

    // set displayName si possible
    const displayName = `${additionalData.firstName || ""} ${
      additionalData.lastName || ""
    }`.trim();
    if (displayName) {
      await FirebaseAuthentication.updateProfile({ displayName });
    }

    const appUser = await this.handleUserDocumentUpsert(firebaseUser, {
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

  async getAppUserProfile(uid: string): Promise<User | null> {
    try {
      return await this.userRepository.findById(uid);
    } catch (error) {
      console.error("Error fetching app user profile in AuthService:", error);
      return null;
    }
  }

  async signOutUser(currentSessionId?: string): Promise<void> {
    try {
      if (currentSessionId) {
        await sessionService.revokeSession(currentSessionId);
      }
      await FirebaseAuthentication.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  async signOutAllDevices(uid: string): Promise<void> {
    try {
      await sessionService.revokeAllSessions(uid);
      await FirebaseAuthentication.signOut();
    } catch (error) {
      console.error("Error signing out all devices:", error);
      throw error;
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await FirebaseAuthentication.sendPasswordResetEmail({ email });
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
    // get current user from capacitor
    const { user: currentUser } = await FirebaseAuthentication.getCurrentUser();
    if (!currentUser) {
      throw new Error("Aucun utilisateur n'est actuellement connecté.");
    }
    try {
      if (currentSessionId) {
        await sessionService.revokeSession(currentSessionId);
      }
      await this.userRepository.delete(currentUser.uid);
      await FirebaseAuthentication.deleteUser();
    } catch (error: any) {
      if (error?.code === "auth/requires-recent-login") {
        throw new Error(
          "Cette opération nécessite une ré-authentification récente. Veuillez vous reconnecter et réessayer."
        );
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
