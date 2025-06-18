import { INotificationRepository } from "@/app/api/notif/INotificationRepository.server";
import { NotificationRepository } from "@/app/api/notif/NotificationRepository";
import { Notification } from "@/types/entities/Notification";
import { User } from "@/types/entities/User";
import { NotificationType } from "@/types/enums/NotificationType";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Service réservé au back-end (API routes / server actions).
 */
export class NotificationService {
  private readonly notificationRepository: INotificationRepository;

  constructor(
    repository: INotificationRepository = new NotificationRepository()
  ) {
    this.notificationRepository = repository;
  }

  /* -------------------------------------------------------------------------- */
  /*  INVITATION – ACCEPTÉE                                                     */
  /* -------------------------------------------------------------------------- */
  async createInviteAcceptedNotification(
    inviter: User,
    accepter: User,
    projectName: string
  ): Promise<void> {
    const accepterName = accepter.displayName || accepter.email;
    const message = `${accepterName} a accepté votre invitation pour rejoindre le projet "${projectName}".`;

    await this.create({
      userId: inviter.uid,
      type: NotificationType.PROJECT_INVITE_ACCEPTED,
      message,
      context: {
        projectId: inviter.companySelected, // adapte si nécessaire
        acceptedBy: accepter.uid,
      },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*  MEMBRE RETIRÉ                                                             */
  /* -------------------------------------------------------------------------- */
  async createProjectRemovedNotification(
    removedUser: User,
    removalData: {
      projectId: string;
      projectName: string;
      removedByUid: string;
    }
  ): Promise<void> {
    const message = `Vous avez été retiré du projet "${removalData.projectName}".`;

    await this.create({
      userId: removedUser.uid,
      type: NotificationType.PROJECT_REMOVED_FROM,
      message,
      context: {
        projectId: removalData.projectId,
        removedBy: removalData.removedByUid,
      },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*  MÉTHODE GÉNÉRIQUE                                                          */
  /* -------------------------------------------------------------------------- */
  private async create(
    data: Omit<Notification, "id" | "createdAt" | "read">
  ): Promise<Notification> {
    const notificationData: Omit<Notification, "id"> = {
      ...data,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    };

    return this.notificationRepository.create(notificationData);
  }
}
