// src/repositories/SessionRepository.ts
import { db } from "@/lib/firebase/client"; // (ou adminDb côté server)
import { Session } from "@/types/entities/Session";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export class SessionRepository {
  private col = collection(db, "sessions");

  async create(
    data: Omit<Session, "sessionId" | "createdAt" | "lastActiveAt">
  ): Promise<Session> {
    const now = serverTimestamp() as Timestamp;
    const res = await addDoc(this.col, {
      ...data,
      createdAt: now,
      lastActiveAt: now,
      revoked: false,
    });

    await updateDoc(res, { sessionId: res.id });

    return {
      ...(data as any),
      sessionId: res.id,
      createdAt: now,
      lastActiveAt: now,
      revoked: false,
    };
  }

  async update(sessionId: string, data: Partial<Session>) {
    const ref = doc(this.col, sessionId);
    await updateDoc(ref, { ...data, lastActiveAt: serverTimestamp() });
  }

  async findByUid(uid: string): Promise<Session[]> {
    const q = query(
      this.col,
      where("uid", "==", uid),
      where("revoked", "==", false)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ sessionId: d.id, ...d.data() } as Session));
  }

  async revoke(sessionId: string) {
    const ref = doc(this.col, sessionId);
    await updateDoc(ref, { revoked: true, leftAt: serverTimestamp() });
  }

  async revokeAll(uid: string) {
    const sessions = await this.findByUid(uid);
    await Promise.all(sessions.map((sess) => this.revoke(sess.sessionId)));
  }
}
