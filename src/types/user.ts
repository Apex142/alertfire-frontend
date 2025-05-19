import { User as FirebaseUser } from 'firebase/auth';

export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  companies: string[]; // Array of company IDs
  preferences?: {
    theme: 'light' | 'dark';
    language: 'fr' | 'en';
    notifications: boolean;
  };
  companySelected?: string;
  firstName?: string;
  lastName?: string;
  fullAddress?: string;
  intent?: string;
  lastLogin?: Date;
  legalStatus?: string;
  phone?: string;
  position?: string;
  onboardingStep?: number;
  favoriteLocationIds?: string[]; // Array of favorite location IDs
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  members: string[]; // Array of user IDs
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}

export interface UserDataState {
  loading: boolean;
  error: Error | null;
  user: FirebaseUser | null;
  userData: FirestoreUser | null;
  projects: ProjectData[];
} 