// src/repositories/INotificationRepository.ts
import { Notification } from "@/types/entities/Notification";

export interface INotificationRepository {
  getUserNotifications(
    uid: string,
    onChange: (notifications: Notification[]) => void,
    onError: (e: any) => void
  ): () => void;

  markAllAsRead(uid: string, notifications: Notification[]): Promise<void>;

  markAsReadAndResponded(notificationId: string): Promise<void>;
}
