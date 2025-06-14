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
  // Pour les locations dans un projet
  private getLocationsCollection(projectId: string) {
    return collection(db, "projects", projectId, "locations");
  }

  // Pour les locations globales (publiques/company)
  private getGlobalLocationsCollection() {
    return collection(db, "locations");
  }

  // ----- Projet -----
  async create(
    projectId: string,
    locationData: Omit<Location, "id" | "createdAt" | "updatedAt">
  ): Promise<Location> {
    const now = serverTimestamp() as Timestamp;
    const colRef = this.getLocationsCollection(projectId);
    const docRef = await addDoc(colRef, {
      ...locationData,
      createdAt: now,
      updatedAt: now,
    });
    return {
      id: docRef.id,
      ...locationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as Location;
  }

  async findById(projectId: string, id: string): Promise<Location | null> {
    const docRef = doc(this.getLocationsCollection(projectId), id);
    const snap = await getDoc(docRef);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Location) : null;
  }

  async update(
    projectId: string,
    id: string,
    data: Partial<Location>
  ): Promise<Location | null> {
    const docRef = doc(this.getLocationsCollection(projectId), id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    const snap = await getDoc(docRef);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Location) : null;
  }

  async delete(projectId: string, id: string): Promise<void> {
    const docRef = doc(this.getLocationsCollection(projectId), id);
    await deleteDoc(docRef);
  }

  async findAll(projectId: string): Promise<Location[]> {
    const colRef = this.getLocationsCollection(projectId);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Location));
  }

  // ----- GLOBAL (Hors projet) -----
  async createGlobal(
    locationData: Omit<Location, "id" | "createdAt" | "updatedAt">
  ): Promise<Location> {
    const now = serverTimestamp() as Timestamp;
    const colRef = this.getGlobalLocationsCollection();
    const docRef = await addDoc(colRef, {
      ...locationData,
      createdAt: now,
      updatedAt: now,
    });
    return {
      id: docRef.id,
      ...locationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as Location;
  }

  async findPublic(): Promise<Location[]> {
    const colRef = this.getGlobalLocationsCollection();
    const q = query(colRef, where("isPublic", "==", true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Location));
  }

  async findByCompany(companyId: string): Promise<Location[]> {
    const colRef = this.getGlobalLocationsCollection();
    const q = query(colRef, where("companyId", "==", companyId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Location));
  }
}
