import { invitationEmailHtml } from "@/emailTemplates/invitationEmail";
import { auth, db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// POST /api/project/invite
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    // --- Body parsing ---
    const body = await req.json();
    const {
      projectId,
      role,
      linkType,
      selectedEvents = [],
      status = "pending",
      technicianUid,
      invitedByUid,
      projectName,
    } = body || {};

    // --- Check des paramètres obligatoires ---
    if (
      !projectId ||
      !role ||
      !role.label ||
      !role.id ||
      !technicianUid ||
      !invitedByUid ||
      !projectName
    ) {
      return NextResponse.json(
        { error: "Paramètres manquants ou invalides." },
        { status: 400 }
      );
    }

    if (decodedToken.uid !== invitedByUid) {
      return NextResponse.json({ error: "Action interdite" }, { status: 403 });
    }

    // --- Récupération de l'utilisateur à inviter ---
    const userDoc = await db.collection("users").doc(technicianUid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Technicien non trouvé" },
        { status: 404 }
      );
    }
    const userData = userDoc.data();

    // --- Création ou récupération membership ---
    let membershipId = null;
    const membershipQuery = await db
      .collection("project_memberships")
      .where("userId", "==", technicianUid)
      .where("projectId", "==", projectId)
      .limit(1)
      .get();

    if (!membershipQuery.empty) {
      const membership = membershipQuery.docs[0].data();
      // Si déjà invité et en attente : erreur explicite
      if (membership.status !== undefined) {
        return NextResponse.json(
          {
            error: "Ce technicien est déjà invité.",
          },
          { status: 409 }
        );
      }
      // Sinon, tu peux continuer (s'il a été refusé, retiré, etc. tu peux le réinviter)
      membershipId = membershipQuery.docs[0].id;
    } else {
      // Création classique du membership
      const docRef = await db.collection("project_memberships").add({
        userId: technicianUid,
        projectId,
        role: role.label,
        status,
        isGlobal: linkType === "project",
        eventIds: linkType === "events" ? selectedEvents : null,
        firstname: userData?.firstName || "",
        lastname: userData?.lastName || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        photo_url: userData?.photoURL || "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      membershipId = docRef.id;
    }

    // --- Update events ---
    if (linkType === "events" && selectedEvents.length > 0 && membershipId) {
      for (const eventId of selectedEvents) {
        if (!eventId) continue;
        const eventRef = db.doc(`projects/${projectId}/events/${eventId}`);
        await eventRef.update({
          members: FieldValue.arrayUnion(membershipId),
        });
      }
    }

    // --- Create post ---
    const postsRef = db.collection(`projects/${projectId}/posts`);
    await postsRef.add({
      isGlobal: linkType === "project",
      eventId: linkType === "events" ? selectedEvents[0] || "" : "",
      createdBy: technicianUid,
      title: role.label,
      icon: role.icon || "",
      priority: role.priority || 0,
      category: role.category || "",
      memberIds: [technicianUid],
      role_template_id: role.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // --- Create notification ---
    if (status === "pending") {
      await db.collection("notifications").add({
        userId: technicianUid,
        projectId,
        message: `Vous avez été invité à rejoindre le projet ${projectName} en tant que ${role.label}`,
        type: "project_invite",
        read: false,
        responded: false,
        createdAt: FieldValue.serverTimestamp(),
        context: {
          invitedBy: invitedByUid,
          role: role.label,
        },
      });
    }

    // --- Send mail via Nodemailer ---
    if (userData?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      try {
        const acceptUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/project/${projectId}/invitations/accept?user=${technicianUid}&project=${projectId}`;

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: process.env.SMTP_FROM_EMAIL,
          to: userData.email,
          subject: `Invitation au projet ${projectName}`,
          text: `Bonjour ${userData.firstName || ""},

Vous avez été invité à rejoindre le projet "${projectName}" en tant que ${
            role.label
          }.

Acceptez l'invitation en cliquant sur ce lien : ${acceptUrl}

Si vous n'avez pas demandé cette invitation, ignorez cet email.`,
          html: invitationEmailHtml({
            firstName: userData.firstName || "",
            projectName,
            roleLabel: role.label,
            acceptUrl,
          }),
        };

        await transporter.sendMail(mailOptions);
      } catch (mailError) {
        // On log, mais on ne bloque pas l'invitation Firestore
        console.warn(
          "[Invitation] Email non envoyé pour l'utilisateur",
          userData.email,
          "Erreur:",
          mailError?.message
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(
      "Erreur POST /api/project/invite :",
      error,
      error?.message,
      error?.stack
    );
    return NextResponse.json(
      { error: "Erreur serveur", message: error?.message },
      { status: 500 }
    );
  }
}
