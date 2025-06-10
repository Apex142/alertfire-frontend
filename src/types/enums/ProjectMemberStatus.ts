// src/types/enums/ProjectMemberStatus.ts
export enum ProjectMemberStatus {
  APPROVED = "approved", // Membre actif, a accepté l'invitation
  PENDING = "pending", // Invitation envoyée, en attente d'acceptation
  REMOVED = "removed", // Retiré par un manager/admin
  DECLINED = "declined", // Invitation refusée par l'utilisateur
  // LEFT = "left", // L'utilisateur a quitté de lui-même (peut être combiné avec removed ou un champ leftAt non nul)
}
