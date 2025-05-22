// types/notification.ts
export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  responded?: boolean;
  context: {
    invitedBy?: string;
    role?: string;
  };
  invitedBy?: string;
  userId: string;
  createdAt?: any;
  avatarUrl?: string;
  projectId?: string;
}
