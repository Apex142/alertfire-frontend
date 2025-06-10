// src/types/entities/Session.ts
import { Timestamp } from "firebase/firestore";

export interface Session {
  sessionId: string;
  uid: string;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
  expiresAt: Timestamp;
  device: string; // "chrome_mac", "ios_app", "edge_win", etc.
  ipAddress?: string;
  revoked: boolean;
  leftAt?: Timestamp; // Quand la session a été explicitement terminée
  userAgent?: string; // Optionnel, info du navigateur
}
