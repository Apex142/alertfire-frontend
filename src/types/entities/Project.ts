import { Timestamp } from "firebase/firestore";
import { ProjectPrivacy } from "../enums/ProjectPrivacy";
import { ProjectStatus } from "../enums/ProjectStatus";

// Un type pour chaque événement de planning
export interface ProjectDayEvent {
  id: string; // unique (uuid ou auto)
  label: string; // ex: "Tournage", "Pause déjeuner"
  description?: string; // optionnel
  type: string; // ex: "TOURNAGE", "REPÉRAGE", "MONTAGE", etc.
  location?: string; // optionnel : "Plateau", "Extérieur", etc.
  startTime: Timestamp; // horodatage exact pour l’événement du jour
  endTime?: Timestamp; // si tu veux gérer des durées
}

// Un type pour la journée de planning
export interface ProjectDayPlanning {
  date: string; // Format 'YYYY-MM-DD', ex: "2025-06-10"
  events: ProjectDayEvent[];
}

export interface Project {
  id: string;
  projectName: string;
  acronym: string;
  description: string;
  color: string;
  companyId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User uid
  startDate: Timestamp;
  endDate: Timestamp;
  privacy: ProjectPrivacy;
  status: ProjectStatus;
  archived: boolean;
  deleted: boolean;
  coverImageUrl: string | null;
  membersCount: number;
  tags: string[];

  dayPlannings: ProjectDayPlanning[];
}
