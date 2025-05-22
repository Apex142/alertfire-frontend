import { auth, db } from "@/lib/firebaseAdmin"; // tes instances admin déjà exportées
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Récupérer l'Authorization Bearer token
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    // Récupérer projectId et userId dans la query string
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const userId = url.searchParams.get("userId");

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur connecté correspond au userId
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Action interdite" }, { status: 403 });
    }

    // Chercher le membership
    const membershipQuery = await db
      .collection("project_memberships")
      .where("userId", "==", userId)
      .where("projectId", "==", projectId)
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      // Pas de membership, donc pas d'invitation acceptée
      return NextResponse.json({ accepted: false });
    }

    const membershipData = membershipQuery.docs[0].data();

    // Retourner si le statut est "approved"
    const accepted = membershipData.status === "approved";

    return NextResponse.json({ accepted });
  } catch (error) {
    console.error("Erreur check invitation API:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Vérifier token Authorization Bearer
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    // Extraire projectId et userId du body JSON
    const { projectId, userId } = await req.json();

    // L'utilisateur connecté doit être le même que userId (sécurité)
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Action interdite" }, { status: 403 });
    }

    // Chercher membership pour ce user et project
    const membershipQuery = await db
      .collection("project_memberships")
      .where("userId", "==", userId)
      .where("projectId", "==", projectId)
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      return NextResponse.json(
        { error: "Membership non trouvé pour cet utilisateur et project" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut à "approved" et la date de mise à jour
    const membershipDoc = membershipQuery.docs[0];
    await db.collection("project_memberships").doc(membershipDoc.id).update({
      status: "approved",
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log("TEST !!!!!!!!!!!!!!!", projectId, userId);

    // Chercher la notification liée à cette invitation (non lue, pas encore traitée)
    const notifQuery = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .where("projectId", "==", projectId)
      .where("type", "==", "project_invite")
      .where("responded", "==", false)
      .limit(1)
      .get();

    if (!notifQuery.empty) {
      const notifDoc = notifQuery.docs[0];
      await db.collection("notifications").doc(notifDoc.id).update({
        read: true,
        responded: true,
        accepted: true,
        respondedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur accept-invitation API:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
