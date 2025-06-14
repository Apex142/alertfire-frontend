// src/app/api/project/invite/route.ts

import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/error";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { InvitationSchema } from "@/types/dtos/invitation.dto";
import { EmailType } from "@/types/enums/EmailType";
import { NotificationType } from "@/types/enums/NotificationType";
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
        { error: "Données invalides.", details: validation.error.flatten() },
        { status: 400 }
      );
    }
    const invitationData = validation.data;

    // 3. Vérifie l'expéditeur
    if (decodedToken.uid !== invitationData.invitedByUid) {
      throw new ForbiddenError(
        "L'utilisateur authentifié n'est pas l'expéditeur."
      );
    }

    // 4. Récupération de l'utilisateur invité
    const userSnap = await adminDb
      .collection("users")
      .doc(invitationData.technicianUid)
      .get();
    if (!userSnap.exists) {
      throw new NotFoundError("Utilisateur à inviter introuvable.");
    }
    const userToInvite = { uid: userSnap.id, ...userSnap.data() } as any;

    // 5. Vérifie si déjà membre
    const membershipQuery = await adminDb
      .collection("project_memberships")
      .where("projectId", "==", invitationData.projectId)
      .where("userId", "==", invitationData.technicianUid)
      .limit(1)
      .get();
    const existing = membershipQuery.empty
      ? null
      : { id: membershipQuery.docs[0].id, ...membershipQuery.docs[0].data() };

    if (
      existing &&
      [ProjectMemberStatus.APPROVED, ProjectMemberStatus.PENDING].includes(
        existing.status
      )
    ) {
      throw new ConflictError(
        "Cet utilisateur est déjà membre ou a une invitation en attente."
      );
    }

    // 6. Création du membership
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
    const membershipId = membershipRef.id;

    // 7. Notification & Email
    const notificationService = new NotificationService();
    const emailService = new EmailService();

    const firstName = userToInvite.firstName || userToInvite.displayName || "";

    if (isPending) {
      // a) Invitation (PENDING)
      await notificationService.createProjectInviteNotification(
        userToInvite,
        invitationData
      );

      await emailService.sendTransactionalEmail(
        EmailType.PROJECT_INVITATION_PENDING,
        userToInvite.email,
        {
          firstName,
          projectName: invitationData.projectName,
          roleLabel: invitationData.role.label,
          acceptUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/project/${invitationData.projectId}/invitations/accept?membership=${membershipId}`,
          projectId: invitationData.projectId,
          invitedByUid: invitationData.invitedByUid,
          membershipId,
        }
      );
    } else {
      // b) Ajout direct (APPROVED)
      await notificationService.create({
        userId: userToInvite.uid,
        type: NotificationType.PROJECT_INVITATION,
        message: `Vous avez été ajouté au projet "${invitationData.projectName}".`,
        context: { projectId: invitationData.projectId },
      });

      await emailService.sendTransactionalEmail(
        EmailType.PROJECT_ADDED,
        userToInvite.email,
        {
          firstName,
          projectName: invitationData.projectName,
        }
      );
    }

    // 8. Réponse
    return NextResponse.json(
      {
        success: true,
        message: isPending
          ? "Invitation envoyée avec succès."
          : "Membre ajouté directement.",
      },
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
