import { EmailService } from "@/app/api/email/EmailService.server";
import { NotificationService } from "@/app/api/notif/NotificationService";
import { ConflictError, NotFoundError } from "@/lib/error";
import { ProjectMembershipRepository } from "@/repositories/ProjectMembershipRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { EmailType } from "@/types/enums/EmailType";
import { ProjectMemberPermission } from "@/types/enums/ProjectMemberPermission";
import { ProjectMemberStatus } from "@/types/enums/ProjectMemberStatus";

export class InvitationService {
  constructor(
    private userRepository: UserRepository,
    private membershipRepository: ProjectMembershipRepository,
    private notificationService: NotificationService,
    private emailService: EmailService
  ) {}

  async inviteUserToProject(data: any): Promise<void> {
    const userToInvite = await this.userRepository.findById(data.technicianUid);
    if (!userToInvite) {
      throw new NotFoundError("L'utilisateur à inviter n'a pas été trouvé.");
    }

    const existingMembership =
      await this.membershipRepository.findByProjectAndUser(
        data.projectId,
        data.technicianUid
      );
    if (
      existingMembership &&
      ["active", "pending"].includes(existingMembership.status)
    ) {
      throw new ConflictError(
        "Cet utilisateur est déjà membre ou a une invitation en attente."
      );
    }

    const newMembership = await this.membershipRepository.create({
      userId: data.technicianUid,
      projectId: data.projectId,
      role: data.role.label,
      permission: ProjectMemberPermission.VIEWER,
      status: ProjectMemberStatus.PENDING,
      invitedBy: data.invitedByUid,
    });

    const emailData = {
      firstName: userToInvite.firstName || userToInvite.displayName,
      projectName: data.projectName,
      roleLabel: data.role.label,
      acceptUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/project/${data.projectId}/invitations/accept?membership=${newMembership.id}`,
    };

    await Promise.all([
      this.notificationService.createProjectInviteNotification(
        userToInvite,
        data
      ),
      this.emailService.sendTransactionalEmail(
        EmailType.PROJECT_INVITATION,
        userToInvite.email,
        emailData,
        `Invitation au projet ${data.projectName}`,
        `Bonjour ${emailData.firstName},\n
Vous avez été invité à rejoindre le projet "${emailData.projectName}" en tant que ${emailData.roleLabel}.
Cliquez ici pour accepter: ${emailData.acceptUrl}`
      ),
    ]);
  }
}
