// src/types/entities/ProjectMembership.ts
import { Timestamp } from "firebase/firestore";
import { ProjectMemberPermission } from "../enums/ProjectMemberPermission";
import { ProjectMemberRole } from "../enums/ProjectMemberRole";
import { ProjectMemberStatus } from "../enums/ProjectMemberStatus";

export interface ProjectMembership {
  id: string; // Firestore document ID (souvent projectId + "_" + userId)
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  permission: ProjectMemberPermission;
  joinedAt: Timestamp;
  invitedBy: string; // User uid
  status: ProjectMemberStatus;
  leftAt: Timestamp | null; // Si l'utilisateur a quitté le projet
}
