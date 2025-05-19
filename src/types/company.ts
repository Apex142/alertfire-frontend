import { Timestamp } from 'firebase/firestore';

export interface Company {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  members: string[];
  settings: {
    defaultCurrency: string;
    language: string;
  };
}