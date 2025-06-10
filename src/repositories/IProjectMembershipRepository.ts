// src/repositories/IProjectMembershipRepository.ts
import { ProjectMembership } from "@/types/entities/ProjectMembership";

export interface IProjectMembershipRepository {
  findById(
    projectId: string,
    userIdAsDocId: string
  ): Promise<ProjectMembership | null>;
  findByProjectAndUser(
    projectId: string,
    userId: string
  ): Promise<ProjectMembership | null>; // Recherche par champ userId
  findUserMemberships(userId: string): Promise<ProjectMembership[]>;
  findProjectMembers(projectId: string): Promise<ProjectMembership[]>;
  // data ne contient plus id, projectId, userId. joinedAt est un serverTimestamp() fourni par le service.
  create(
    projectId: string,
    userIdAsDocId: string,
    data: Omit<ProjectMembership, "id" | "projectId" | "userId">
  ): Promise<ProjectMembership>;
  update(
    projectId: string,
    userIdAsDocId: string,
    data: Partial<
      Omit<
        ProjectMembership,
        "id" | "projectId" | "userId" | "joinedAt" | "invitedBy"
      >
    >
  ): Promise<ProjectMembership | null>;
  delete(projectId: string, userIdAsDocId: string): Promise<void>;
}
