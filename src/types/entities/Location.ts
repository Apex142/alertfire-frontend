import { FieldValue, Timestamp } from "firebase/firestore";
import { EditPolicy } from "../enums/EditPolicy";

export interface LocationModification {
  userId: string;
  date: Timestamp | FieldValue;
  changes: Record<string, any>;
  comment?: string;
}

export interface Location {
  id?: string;
  address: string;
  label: string;
  notes?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  createdBy: string; // UID utilisateur
  editPolicy: EditPolicy; // Enum, ex: "private" | "company" | "public"
  isLegit: boolean;
  isPublic: boolean;
  version: number;
  modificationHistory: LocationModification[];
  pendingModifications: LocationModification[];
  // Optionnel : lier un lieu à plusieurs projets sans sous-collection
  projectIds?: string[];
  companyId?: string; // Optionnel : si lié à une entreprise
}
