import { adminDb } from "@/lib/firebase/admin";
import { Notification } from "@/types/entities/Notification";
import { INotificationRepository } from "./INotificationRepository.server";

export class NotificationRepository implements INotificationRepository {
  private collection = adminDb.collection("notifications");

  async create(data: Omit<Notification, "id">): Promise<Notification> {
    const docRef = await this.collection.add(data);
    // L'admin SDK résout immédiatement le serverTimestamp à la création
    const createdSnap = await docRef.get();
    return { id: docRef.id, ...(createdSnap.data() as Notification) };
  }
}
