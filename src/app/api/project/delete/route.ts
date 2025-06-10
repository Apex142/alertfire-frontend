import { deleteProjectEmailHtml } from "@/emailTemplates/deleteProjectEmail";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Utilitaire : suppression en masse d'une collection
async function deleteCollection(path: string) {
  const snap = await adminDb.collection(path).get();
  const batch = adminDb.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

export async function DELETE(req: NextRequest) {
  try {
    // --- Auth ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];
    await adminAuth.verifyIdToken(idToken);

    // --- Récupère le projectId depuis la query ---
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId manquant" },
        { status: 400 }
      );
    }

    // --- Récupère le projet ---
    const projectSnap = await adminDb
      .collection("projects")
      .doc(projectId)
      .get();
    if (!projectSnap.exists) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 }
      );
    }
    const projectData = projectSnap.data();
    const projectName = projectData?.projectName || "Projet supprimé";

    // --- Récupère tous les membres du projet ---
    const membershipsSnap = await adminDb
      .collection("project_memberships")
      .where("projectId", "==", projectId)
      .get();
    const userIds: string[] = membershipsSnap.docs.map(
      (doc) => doc.data().userId
    );

    // --- Supprime les sous-collections du projet ---
    await Promise.all([
      deleteCollection(`projects/${projectId}/events`),
      deleteCollection(`projects/${projectId}/posts`),
      deleteCollection(`projects/${projectId}/messages`),
      // Ajoute ici d’autres sous-collections si besoin
    ]);

    // --- Supprime les project_memberships ---
    {
      const batch = adminDb.batch();
      membershipsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // --- Supprime les notifications liées au projet ---
    {
      const notifsSnap = await adminDb
        .collection("notifications")
        .where("projectId", "==", projectId)
        .get();
      const batch = db.batch();
      notifsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // --- Supprime le projet ---
    await adminDb.collection("projects").doc(projectId).delete();

    // --- Notification et mail à chaque membre ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    for (const userId of userIds) {
      // Notif Firestore
      await adminDb.collection("notifications").add({
        userId,
        message: `Le projet "${projectName}" a été supprimé.`,
        type: "project_deleted",
        read: false,
        createdAt: new Date(),
        context: { projectId },
      });

      // Email
      const userDoc = await adminDb.collection("users").doc(userId).get();
      const firstName = userDoc.data()?.firstName;
      const email = userDoc.data()?.email;
      if (email) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: `Projet supprimé : ${projectName}`,
            text: `Bonjour${
              firstName ? ` ${firstName}` : ""
            },\n\nLe projet "${projectName}" auquel vous participiez a été supprimé.\n\nL'équipe Showmate.`,
            html: deleteProjectEmailHtml({ firstName, projectName }),
          });
        } catch (err) {
          // Ignore email errors, log only
          console.error(`Erreur mail vers ${email}:`, err);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/project/delete]", error);
    return NextResponse.json(
      { error: error?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
