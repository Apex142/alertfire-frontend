import { Timestamp, FieldValue } from "firebase/firestore";
import { EditPolicy } from "../enums/EditPolicy";

export interface Location {
  id?: string; // Ajouté pour compatibilité avec Firestore et front
  address: string;
  label: string;
  notes?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  createdBy: string; // UID utilisateur
  editPolicy: EditPolicy;
  isLegit: boolean;
  isPublic: boolean;
  modificationHistory: LocationModification[]; // Voir ci-dessous
  pendingModifications: LocationModification[]; // Idem
  version: number;
}

// Historique des modifications ou suggestions de modif
export interface LocationModification {
  userId: string;
  date: Timestamp | FieldValue;
  changes: Record<string, any>; // Champs modifiés (clé: valeur)
  comment?: string;
}
