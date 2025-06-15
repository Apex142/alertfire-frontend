// src/types/entities/FireAlert.ts
import { Timestamp } from "firebase/firestore";

export interface FireAlert {
  id: string;
  project_id: string;

  /* mesures */
  co2_level: number;
  temperature: number;

  /* détection */
  confidence: number; // score 0-1
  is_fire: boolean;

  /* datation */
  timestamp: Timestamp; // Firestore -> à caster en Date côté UI si besoin
}
