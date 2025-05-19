import { Timestamp } from 'firebase/firestore';

export type ProjectStatus = 'Confirmé' | 'À confirmer' | 'Annulé' | 'Optionnel';
export type ProjectPrivacy = 'public' | 'privé';

export interface Project {
  id: string;
  projectName: string;
  acronym?: string;
  color: string;
  description?: string;
  status: ProjectStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  companyId: string;
  createdBy: string;
  privacy: ProjectPrivacy;
  updatedAt: Timestamp;
  createdAt: Timestamp;
} 