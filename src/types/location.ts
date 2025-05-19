import { Timestamp } from 'firebase/firestore';

export type EditPolicy = 'creativecommon' | 'company' | 'private';

export interface LocationModification {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface Location {
  id: string;
  label: string;
  address: string;
  notes?: string;
  isPublic: boolean;
  companyId?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isLegit: boolean;
  editPolicy: EditPolicy;
  lastModifiedBy?: string;
  modificationHistory?: LocationModification[];
  pendingModifications?: LocationModification[];
  version: number; // Pour suivre les versions des modifications
}

export interface ProjectLocation {
  id: string;
  label: string;
  address: string;
  notes?: string;
  locationId?: string; // Référence vers le lieu global si existant
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 