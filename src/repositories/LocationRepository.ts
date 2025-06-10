import { db } from "@/lib/firebase/client";
import { Location } from "@/types/entities/Location";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { ILocationRepository } from "./ILocationRepository";

export class LocationRepository implements ILocationRepository {
  private locationsCollection = collection(db, "locations");

  async create(
    locationData: Omit<Location, "id" | "createdAt" | "updatedAt">
  ): Promise<Location> {
    const now = serverTimestamp() as Timestamp;
    const docRef = await addDoc(this.locationsCollection, {
      ...locationData,
      createdAt: now,
      updatedAt: now,
    });
    // Retourne l'objet sans attendre la résolution des timestamps
    return {
      id: docRef.id,
      ...locationData,
      createdAt: Timestamp.now(), // Approximation pour affichage immédiat
      updatedAt: Timestamp.now(),
    } as Location;
  }

  async findById(id: string): Promise<Location | null> {
    const locationRef = doc(this.locationsCollection, id);
    const snap = await getDoc(locationRef);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Location) : null;
  }

  async update(id: string, data: Partial<Location>): Promise<Location | null> {
    const locationRef = doc(this.locationsCollection, id);
    await updateDoc(locationRef, { ...data, updatedAt: serverTimestamp() });
    const snap = await getDoc(locationRef);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Location) : null;
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.locationsCollection, id));
  }

  async findByCreator(userId: string): Promise<Location[]> {
    const q = query(this.locationsCollection, where("createdBy", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Location));
  }

  async findByCompany(companyId: string): Promise<Location[]> {
    const q = query(
      this.locationsCollection,
      where("companyId", "==", companyId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Location));
  }

  async findPublic(): Promise<Location[]> {
    const q = query(this.locationsCollection, where("isPublic", "==", true));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Location));
  }
}
