// src/services/NotificationService.client.ts
import { NotificationRepository } from "@/repositories/NotificationRepository";

export class NotificationService {
  private repository: NotificationRepository;

  constructor(repository?: NotificationRepository) {
    this.repository = repository || new NotificationRepository();
  }

  subscribeToUserNotifications(uid: string, onChange: any, onError: any) {
    return this.repository.getUserNotifications(uid, onChange, onError);
  }

  async markAllAsRead(uid: string, notifications: any[]) {
    return this.repository.markAllAsRead(uid, notifications);
  }

  async handleNotificationAction({
    notif,
    accepted,
    userUid,
  }: {
    notif: any;
    accepted: boolean;
    userUid: string;
  }) {
    await this.repository.markAsReadAndResponded(notif.id);

    if (notif.context?.projectId) {
      const membershipId = `${notif.context.projectId}_${userUid}`;

      // Acceptation ou refus -> update membership et API call pour informer l'inviteur
      if (accepted) {
        // Appel API pour notifier l’inviteur
        await fetch("/api/project/accepted-invitation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inviteId: notif.id,
            userIdResponding: userUid,
            userNameResponding: notif.userName || "", // ou récupère dynamiquement selon ton contexte
            projectId: notif.context.projectId,
            invitedByUid: notif.context.invitedBy,
          }),
        });
      } else if (notif.context.invitedBy) {
        await fetch("/api/project/refused-invitation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inviteId: notif.id,
            userIdResponding: userUid,
            userNameResponding: notif.userName || "",
            projectId: notif.context.projectId,
            invitedByUid: notif.context.invitedBy,
          }),
        });
      }
    }
  }
}
