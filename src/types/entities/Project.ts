// src/types/entities/Project.ts
import { Timestamp } from "firebase/firestore";
import { ProjectStatus } from "../enums/ProjectStatus";
import { SensorReading } from "../enums/SensorReading";

/** Une activation (détection, test manuel, etc.) */
export interface Activation {
  id: string; // UID de l’activation
  at: Timestamp; // horodatage
  reading: SensorReading; // mesures associées (température, fumée…)
}

export interface Project {
  /* Identité */
  id: string;
  name: string;
  description?: string;

  /* Localisation */
  latitude: number;
  longitude: number;
  altitude?: number;

  /* État */
  status: ProjectStatus; // ok | warning | fire | burned | offline
  isMaster?: boolean; // nœud maître ?

  /* Données capteurs */
  lastReading?: SensorReading;
  lastSeenAt?: Timestamp;

  /* Activations */
  activations: Activation[]; // historique complet
  activationCount: number; // compteur rapide (activations.length)

  /* Métadonnées */
  createdAt: Timestamp;
  updatedAt: Timestamp;
  installedAt?: Timestamp;

  /* Gestionnaires */
  ownerCompanyId: string;
  technicianIds: string[];
  firefighterIds: string[];

  /* Suppression logique */
  isDeleted?: boolean;
}
