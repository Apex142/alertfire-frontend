import { Notification } from "@/types/entities/Notification";

export interface INotificationRepository {
  create(notificationData: Omit<Notification, "id">): Promise<Notification>;
}
