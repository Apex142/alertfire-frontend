// src/lib/strategies/ProjectPermissionStrategy.ts
import { Project } from "@/types/entities/Project";
import { ProjectMembership } from "@/types/entities/ProjectMembership";
import { User } from "@/types/entities/User";
import { IPermissionStrategy, ResourceAction } from "./IPermissionStrategy";

export class ProjectPermissionStrategy implements IPermissionStrategy<Project> {
  async can(
    user: User | null,
    action: ResourceAction,
    project: Project,
    membership?: ProjectMembership | null
  ): Promise<boolean> {
    // ... (logique identique à l'exemple précédent)
    if (!user) {
      return project.privacy === "public" && action === "view";
    }
    // ... reste de la logique
    return false;
  }
}
