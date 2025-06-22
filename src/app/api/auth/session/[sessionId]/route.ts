// app/api/auth/session/[sessionId]/route.ts
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ← corrige l’erreur

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  console.log("DELETE session", sessionId);

  const ref = adminDb.doc(`sessions/${sessionId}`);
  const snap = await ref.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { uid } = snap.data() as { uid?: string };
  if (!uid) {
    return NextResponse.json({ error: "No uid in session" }, { status: 400 });
  }

  await ref.delete(); // supprime le doc Firestore
  await adminAuth.revokeRefreshTokens(uid); // révoque les tokens Firebase

  return NextResponse.json({ ok: true });
}
