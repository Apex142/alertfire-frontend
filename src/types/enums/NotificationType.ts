// src/types/enums/NotificationType.ts
export enum NotificationType {
  // Gestion des Projets & Membres
  PROJECT_INVITATION = "project_invitation", // Invitation à un projet
  PROJECT_INVITE_RECEIVED = "project_invite_received", // Vous avez reçu une invitation
  PROJECT_INVITE_ACCEPTED = "project_invite_accepted", // Votre invitation a été acceptée par quelqu'un d'autre
  PROJECT_INVITE_REJECTED = "project_invite_rejected", // Votre invitation a été refusée
  PROJECT_MEMBER_ADDED = "project_member_added", // Vous avez été ajouté à un projet
  PROJECT_MEMBER_LEFT = "project_member_left", // Un membre a quitté un de vos projets
  PROJECT_REMOVED_FROM = "project_removed_from", // Vous avez été retiré d'un projet (correspond à votre "project_removed")
  PROJECT_ROLE_UPDATED = "project_role_updated", // Votre rôle dans un projet a changé

  // Tâches (si applicable)
  TASK_ASSIGNED = "task_assigned", // Une tâche vous a été assignée
  TASK_COMPLETED = "task_completed", // Une tâche est marquée comme terminée
  TASK_MENTION = "task_mention", // Vous avez été mentionné dans une tâche

  // Commentaires (si applicable)
  COMMENT_MENTION = "comment_mention", // Vous avez été mentionné dans un commentaire

  // Général
  GENERAL_INFO = "general_info", // Notification d'information générale
  SYSTEM_ALERT = "system_alert",
}
