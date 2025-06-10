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
  globalRole: GlobalRole;
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
