import { FieldValue } from "firebase-admin/firestore";
import { NotificationType } from "../enums/NotificationType";

export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  message: string;
  context: Record<string, any>;
  read: boolean;
  createdAt: FieldValue;
}
