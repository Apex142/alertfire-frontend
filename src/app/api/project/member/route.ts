// src/app/api/project/member/route.ts
import { AppError, ForbiddenError, NotFoundError } from "@/lib/error";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { EmailType } from "@/types/enums/EmailType";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EmailService } from "../../email/EmailService.server";
import { NotificationService } from "../../notif/NotificationService";

/* -------------------------------------------------------------------------- */
/* 1. Validation de la requête DELETE avec Zod                                */
/* -------------------------------------------------------------------------- */
const MemberRemovalSchema = z.object({
  membershipId: z.string().min(1),
  userId: z.string().min(1),
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  removedByUid: z.string().min(1),
});
type MemberRemovalInput = z.infer<typeof MemberRemovalSchema>;

/* -------------------------------------------------------------------------- */
/* 2. Route DELETE /api/project/member                                        */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: NextRequest) {
  try {
    // Authentification Firebase
    const idToken = req.headers.get("authorization")?.split("Bearer ")[1];
    console.log("[API_MEMBER_REMOVE] idToken:");
    console.log(idToken);
    if (!idToken) {
      return NextResponse.json(
        { error: "Jeton d'authentification manquant." },
        { status: 401 }
      );
    }
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Validation du body
    const body = await req.json();
    const validation = MemberRemovalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données de la requête invalides.",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }
    const data: MemberRemovalInput = validation.data;

    // Vérification que l'utilisateur connecté est bien l'auteur du retrait
    if (decoded.uid !== data.removedByUid) {
      throw new ForbiddenError(
        "L'utilisateur authentifié ne correspond pas à celui qui retire le membre."
      );
    }

    // Récupération de l'utilisateur retiré
    const userSnap = await adminDb.collection("users").doc(data.userId).get();
    if (!userSnap.exists) {
      throw new NotFoundError("L'utilisateur à retirer n'a pas été trouvé.");
    }
    const user = { uid: userSnap.id, ...userSnap.data() } as any;

    // Vérification du membership
    const membershipRef = adminDb
      .collection("project_memberships")
      .doc(data.membershipId);
    const membershipSnap = await membershipRef.get();
    if (!membershipSnap.exists) {
      throw new NotFoundError("Le membership spécifié est introuvable.");
    }

    // Suppression effective
    await membershipRef.delete();

    // Création de la notification
    const notificationService = new NotificationService();
    await notificationService.createProjectRemovedNotification(user, data);

    // Envoi de l'email de notification
    const emailService = new EmailService();
    await emailService.sendTransactionalEmail(
      EmailType.PROJECT_REMOVED,
      user.email,
      {
        firstName: user.firstName || user.displayName || "",
        projectName: data.projectName,
        removedByUid: data.removedByUid,
        projectId: data.projectId,
      }
    );

    return NextResponse.json(
      { success: true, message: "Membre retiré avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API_MEMBER_REMOVE_ERROR]", error);
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
