// src/lib/strategies/IPermissionStrategy.ts
// Ou src/types/strategies.ts si vous voulez centraliser tous les types d'interfaces
import { ProjectMembership } from "@/types/entities/ProjectMembership";
import { User } from "@/types/entities/User"; // Ajustement

export type ResourceAction =
  | "view"
  | "edit"
  | "delete"
  | "manage_members"
  | "archive";

export interface IPermissionStrategy<TResource> {
  can(
    user: User | null,
    action: ResourceAction,
    resource: TResource,
    membership?: ProjectMembership | null
  ): Promise<boolean>;
}
