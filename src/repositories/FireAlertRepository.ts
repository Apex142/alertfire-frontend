// src/repositories/FireAlertRepository.ts
import { db } from "@/lib/firebase/client";
import { FireAlert } from "@/types/entities/FireAlerts";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  QuerySnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { IFireAlertRepository } from "./IFireAlertRepository";

const COLLECTION = "fire_alerts";

export class FireAlertRepository implements IFireAlertRepository {
  async getAll(): Promise<FireAlert[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FireAlert));
  }

  async getById(id: string): Promise<FireAlert | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    return snap.exists()
      ? ({ id: snap.id, ...snap.data() } as FireAlert)
      : null;
  }

  async create(alert: FireAlert): Promise<void> {
    await setDoc(doc(db, COLLECTION, alert.id), alert);
  }

  async update(id: string, alert: Partial<FireAlert>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), alert);
  }

  async delete(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { is_fire: false });
  }

  /** 🔁 Observe en temps réel */
  onSnapshot(
    callback: (alerts: FireAlert[]) => void,
    error?: (e: Error) => void
  ): () => void {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      (snapshot: QuerySnapshot) => {
        const alerts = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as FireAlert)
        );
        callback(alerts);
      },
      error
    );

    return unsubscribe;
  }
}
