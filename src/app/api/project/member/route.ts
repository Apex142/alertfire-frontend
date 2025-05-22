import { memberRemovedEmailHtml } from "@/emailTemplates/memberRemovedEmail";
import { db } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Méthode DELETE pour retirer un membre d’un projet
export async function DELETE(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];
    // Optionnel: vérifier le token Firebase si tu veux (sinon skip)
    // const decoded = await auth.verifyIdToken(idToken);

    const { membershipId, userId, projectId, projectName } = await req.json();

    if (!membershipId || !userId || !projectId || !projectName) {
      return NextResponse.json(
        { error: "Paramètres manquants." },
        { status: 400 }
      );
    }

    // Récupérer infos utilisateur
    const userDoc = await db.collection("users").doc(userId).get();
    const user = userDoc.data();
    const email = user?.email;
    const firstName = user?.firstName || "";

    // Suppression du membership
    await db.collection("project_memberships").doc(membershipId).delete();

    // Optionnel: Remove from events "members" array if needed

    // Notification (ajoute si tu veux dans ta bdd)
    await db.collection("notifications").add({
      userId,
      projectId,
      type: "project_removed",
      message: `Vous avez été retiré du projet ${projectName}.`,
      read: false,
      createdAt: new Date(),
    });

    // Email
    if (email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL,
          to: email,
          subject: `Retrait du projet : ${projectName}`,
          text: `Bonjour${
            firstName ? ` ${firstName}` : ""
          },\n\nVous avez été retiré du projet "${projectName}".\n\nL'équipe Showmate.`,
          html: memberRemovedEmailHtml({ firstName, projectName }),
        });
      } catch (e) {
        console.error("Erreur envoi mail retrait membre:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur API /project/member DELETE :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
