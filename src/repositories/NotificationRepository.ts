import { db } from "@/lib/firebase/client";
import { Notification } from "@/types/entities/Notification";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { INotificationRepository } from "./INotificationRepository";

export class NotificationRepository implements INotificationRepository {
  getUserNotifications(
    uid: string,
    onChange: (notifications: Notification[]) => void,
    onError: (error: Error) => void
  ) {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docNode) => {
          const d = docNode.data();
          return {
            ...(d as Omit<Notification, "id" | "createdAt">),
            id: docNode.id,
            createdAt:
              d.createdAt instanceof Timestamp ? d.createdAt : Timestamp.now(),
          } as Notification;
        });
        onChange(data);
      },
      onError
    );
  }

  async markAllAsRead(uid: string, notifications: Notification[]) {
    const batch = writeBatch(db);
    notifications
      .filter((n) => !n.read && typeof n.id === "string")
      .forEach((notif) => {
        batch.update(doc(db, "notifications", notif.id as string), {
          read: true,
          updatedAt: serverTimestamp(),
        });
      });
    await batch.commit();
  }

  async markAsReadAndResponded(notificationId: string) {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
      responded: true,
      updatedAt: serverTimestamp(),
    });
  }
}
