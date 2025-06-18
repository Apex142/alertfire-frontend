import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const sessionId = params.sessionId;

  // Récupérer la session pour obtenir l'UID de l'utilisateur concerné
  const sessionSnap = await adminDb.doc(`sessions/${sessionId}`).get();
  if (!sessionSnap.exists) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const sessionData = sessionSnap.data();
  const uid = sessionData?.uid;
  if (!uid) {
    return NextResponse.json({ error: "No uid in session" }, { status: 400 });
  }

  // Supprimer la session Firestore
  await adminDb.doc(`sessions/${sessionId}`).delete();

  // Révoquer le refreshToken de l'utilisateur (force déconnexion partout)
  await adminAuth.revokeRefreshTokens(uid);

  return NextResponse.json({ ok: true });
}
