import { ProjectMembership } from "@/types/entities/ProjectMembership";
import { User } from "@/types/entities/User";

export type HydratedTechnician = ProjectMembership & Partial<User>;

export function mergeMembershipsWithUsers(
  memberships: ProjectMembership[],
  users: User[]
): HydratedTechnician[] {
  const userMap = new Map(users.map((u) => [u.uid, u]));
  return memberships.map((m) => ({
    ...m,
    ...(userMap.get(m.userId) || {}),
  }));
}
