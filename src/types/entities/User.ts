import { Timestamp } from "firebase/firestore";
import { GlobalRole } from "../enums/GlobalRole"; // Ajustement du chemin

export interface UserPreferences {
  theme: "light" | "dark";
  language: "fr" | "en";
  notifications: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;
  onboardingStep: number;
  onboardingCompleted: boolean;
<<<<<<< HEAD
<<<<<<< HEAD
  globalRole: GlobalRole;
=======
  globalRole: GlobalRole[];
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
  globalRole: GlobalRole[];
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
  companies: string[];
  companySelected: string | null;
  preferences: UserPreferences;
  firstName: string;
  lastName: string;
  fullAddress: string;
  legalStatus: string;
  phone: string;
  position: string;
  intent: string;
  favoriteLocationIds: string[];
  isBanned?: boolean; // Default to false or undefined
}
