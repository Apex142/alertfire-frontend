// src/types/enums/ProjectMemberPermission.ts
export enum ProjectMemberPermission {
  MANAGER = "manager", // Peut gérer les membres, modifier le projet
  EDITOR = "editor", // Peut modifier le contenu du projet
  VIEWER = "viewer", // Peut seulement voir
}
