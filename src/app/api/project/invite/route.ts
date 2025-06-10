import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/error";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { InvitationSchema } from "@/types/dtos/invitation.dto";
import { EmailType } from "@/types/enums/EmailType";
import { ProjectMemberPermission } from "@/types/enums/ProjectMemberPermission";
import { ProjectMemberStatus } from "@/types/enums/ProjectMemberStatus";
import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "../../email/EmailService.server";
import { NotificationService } from "../../notif/NotificationService";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const idToken = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!idToken) {
      return NextResponse.json(
        { error: "Jeton d'authentification manquant." },
        { status: 401 }
      );
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // 2. Validation des données
    const body = await req.json();
    const validation = InvitationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données de la requête invalides.",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }
    const invitationData = validation.data;

    // 3. Vérification de l'expéditeur
    if (decodedToken.uid !== invitationData.invitedByUid) {
      throw new ForbiddenError(
        "L'utilisateur authentifié ne correspond pas à l'expéditeur de l'invitation."
      );
    }

    // 4. Récupération de l'utilisateur invité
    const userSnap = await adminDb
      .collection("users")
      .doc(invitationData.technicianUid)
      .get();
    if (!userSnap.exists) {
      throw new NotFoundError("L'utilisateur à inviter n'a pas été trouvé.");
    }
    const userToInvite = { uid: userSnap.id, ...userSnap.data() };

    // 5. Vérifie s'il existe déjà un membership
    const membershipQuery = await adminDb
      .collection("project_memberships")
      .where("projectId", "==", invitationData.projectId)
      .where("userId", "==", invitationData.technicianUid)
      .limit(1)
      .get();
    const existingMembership = !membershipQuery.empty
      ? { id: membershipQuery.docs[0].id, ...membershipQuery.docs[0].data() }
      : null;
    if (
      existingMembership &&
      [ProjectMemberStatus.APPROVED, ProjectMemberStatus.PENDING].includes(
        existingMembership.status
      )
    ) {
      throw new ConflictError(
        "Cet utilisateur est déjà membre ou a une invitation en attente."
      );
    }

    // 6. Crée le membership
    const isPending = invitationData.status === ProjectMemberStatus.PENDING;
    const membershipRef = await adminDb.collection("project_memberships").add({
      userId: invitationData.technicianUid,
      projectId: invitationData.projectId,
      role: invitationData.role.label,
      permission: ProjectMemberPermission.VIEWER,
      status: isPending
        ? ProjectMemberStatus.PENDING
        : ProjectMemberStatus.APPROVED,
      invitedBy: invitationData.invitedByUid,
      joinedAt: new Date(),
    });
    const newMembershipSnap = await membershipRef.get();
    const newMembership = { id: membershipRef.id, ...newMembershipSnap.data() };

    // 7. Crée la notification via le service (admin/server only)
    const notificationService = new NotificationService();
    await notificationService.createProjectInviteNotification(
      userToInvite,
      invitationData
    );

    // 8. Envoi de l'email d'invitation via EmailService factorisé
    const emailType = isPending
      ? EmailType.PROJECT_INVITATION_PENDING
      : EmailType.PROJECT_INVITATION;
    const userData = userSnap.data() || {};
    const emailData = {
      firstName: userData.firstName || userData.displayName || "",
      projectName: invitationData.projectName,
      roleLabel: invitationData.role.label,
      acceptUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/project/${invitationData.projectId}/invitations/accept?membership=${newMembership.id}`,
    };

    const emailService = new EmailService();
    await emailService.sendTransactionalEmail(
      emailType,
      userData.email,
      emailData
    );

    return NextResponse.json(
      { success: true, message: "Invitation envoyée avec succès." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API_INVITE_ERROR]", error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
