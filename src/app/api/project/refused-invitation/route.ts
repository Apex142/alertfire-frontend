import { invitationRefusedEmailHtml } from "@/emailTemplates/invitationRefusedMail";
import { db } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // --- Parse payload ---
    console.log("[POST /api/project/refused-invitation]");

    const { inviteId, userId, projectId, invitedBy, invitedUserName } =
      await req.json();
    if (!invitedBy || !projectId || !invitedUserName) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // --- Récupère l'inviteur ---
    const inviterDoc = await db.collection("users").doc(invitedBy).get();
    if (!inviterDoc.exists) {
      return NextResponse.json(
        { error: "Inviteur introuvable" },
        { status: 404 }
      );
    }
    const inviterData = inviterDoc.data();
    const inviterEmail = inviterData?.email;
    const inviterFirstName =
      inviterData?.firstName || inviterData?.firstname || "";

    // --- Récupère le nom du projet ---
    const projectDoc = await db.collection("projects").doc(projectId).get();
    if (!projectDoc.exists) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 }
      );
    }
    const projectData = projectDoc.data();
    const projectName = projectData?.projectName || "Ce projet";

    // --- Crée une notification Firestore ---
    await db.collection("notifications").add({
      userId: invitedBy,
      type: "invitation_refused",
      projectId,
      read: false,
      createdAt: new Date(),
      title: "Invitation refusée",
      message: `${invitedUserName} a refusé votre invitation au projet "${projectName}".`,
      context: { projectId, inviteId },
    });

    // --- Met à jour le statut dans project_memberships ---
    // On cherche le document du membership qui correspond à ce refus
    // (userId = invité, projectId = le projet concerné)
    const membershipQuery = await db
      .collection("project_memberships")
      .where("userId", "==", userId) // inviteId = user invité
      .where("projectId", "==", projectId)
      .get();

    console.log("userId", userId);
    console.log("projectId", projectId);
    console.log("MEMBERSHIP QUERY", membershipQuery.docs);

    if (!membershipQuery.empty) {
      // On prend le premier doc trouvé et on le met à jour
      console.log("REFUSED INVITATION", membershipQuery.docs[0].id);

      const membershipDoc = membershipQuery.docs[0];
      await db.collection("project_memberships").doc(membershipDoc.id).update({
        status: "declined",
        updatedAt: new Date(),
      });
    }

    // --- Prépare et envoie le mail ---
    if (inviterEmail) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const html = invitationRefusedEmailHtml({
        firstName: inviterFirstName,
        projectName,
        invitedUserName,
      });

      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL,
          to: inviterEmail,
          subject: `Invitation refusée : ${projectName}`,
          text: `Bonjour${
            inviterFirstName ? " " + inviterFirstName : ""
          },\n\n${invitedUserName} a refusé votre invitation à rejoindre le projet "${projectName}".\n\nL'équipe Showmate.`,
          html,
        });
      } catch (err) {
        console.error("Erreur mail refus invitation:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[POST /api/notifications/invitation-refused]", error);
    return NextResponse.json(
      { error: error?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
