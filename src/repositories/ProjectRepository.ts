// src/repositories/ProjectRepository.ts
import { db } from "@/lib/firebase/client";
import { Project } from "@/types/entities/Project";
import { ProjectPrivacy } from "@/types/enums/ProjectPrivacy"; // Importer pour les valeurs par défaut si nécessaire
import { ProjectStatus } from "@/types/enums/ProjectStatus"; // Importer pour les valeurs par défaut si nécessaire
import {
  DocumentData,
  DocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc, // Pour un typage plus précis de docSnap
  documentId,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { IProjectRepository } from "./IProjectRepository";

const PROJECTS_COLLECTION = "projects";

const mapDocToProject = (docSnap: DocumentSnapshot<DocumentData>): Project => {
  const data = docSnap.data();
  if (!data) {
    // Sécurité si data() est undefined, bien que exists() devrait le prévenir
    throw new Error(`No data found for project document ${docSnap.id}`);
  }
  return {
    id: docSnap.id,
    projectName: data.projectName,
    acronym: data.acronym || null,
    description: data.description || null,
    color: data.color,
    companyId: data.companyId,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
    createdBy: data.createdBy,
    startDate: data.startDate as Timestamp,
    endDate: data.endDate as Timestamp,
    privacy: data.privacy as ProjectPrivacy, // Cast vers l'enum
    status: data.status as ProjectStatus, // Cast vers l'enum
    archived: data.archived || false,
    deleted: data.deleted || false,
    coverImageUrl: data.coverImageUrl || null,
    membersCount: data.membersCount || 0,
    tags: data.tags || null,
  };
};

export class ProjectRepository implements IProjectRepository {
  private projectsCollectionRef = collection(db, PROJECTS_COLLECTION);

  async findById(id: string): Promise<Project | null> {
    if (!id || typeof id !== "string") {
      console.error("ProjectRepository: findById called with invalid id:", id);
      return null;
    }
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return mapDocToProject(docSnap);
    }
    return null;
  }

  async findByField(fieldName: keyof Project, value: any): Promise<Project[]> {
    const q = query(
      this.projectsCollectionRef,
      where(fieldName as string, "==", value)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => mapDocToProject(docSnap));
  }

  async findWhereIn(
    fieldName: keyof Project | "id",
    values: string[]
  ): Promise<Project[]> {
    if (!values || values.length === 0) return [];
    const validValues = values.filter(
      (v) => typeof v === "string" && v.length > 0
    );
    if (validValues.length === 0) return [];

    // Firestore 'in' queries are limited, typically to 30 values.
    const CHUNK_SIZE = 30;
    const results: Project[] = [];

    for (let i = 0; i < validValues.length; i += CHUNK_SIZE) {
      const chunk = validValues.slice(i, i + CHUNK_SIZE);
      const actualFieldName = fieldName === "id" ? documentId() : fieldName;
      const q = query(
        this.projectsCollectionRef,
        where(actualFieldName as string, "in", chunk)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach((docSnap) =>
        results.push(mapDocToProject(docSnap))
      );
    }
    return results;
  }

  async getAll(): Promise<Project[]> {
    const querySnapshot = await getDocs(this.projectsCollectionRef);
    return querySnapshot.docs.map((docSnap) => mapDocToProject(docSnap));
  }

  async create(data: Omit<Project, "id">): Promise<Project> {
    // `createdAt` et `updatedAt` doivent être des serverTimestamps fournis par le service appelant dans `data`.
    const docRef = await addDoc(this.projectsCollectionRef, data);
    const newDocSnap = await getDoc(docRef);
    if (!newDocSnap.exists()) {
      throw new Error(
        "Failed to create project document or retrieve it after creation."
      );
    }
    return mapDocToProject(newDocSnap);
  }

  async update(
    id: string,
    data: Partial<Omit<Project, "id" | "createdAt" | "createdBy">>
  ): Promise<Project | null> {
    if (!id || typeof id !== "string") {
      console.error("ProjectRepository: update called with invalid id:", id);
      return null;
    }
    // `updatedAt` doit être un serverTimestamp fourni par le service appelant dans `data`.
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await updateDoc(docRef, data);
    const updatedDocSnap = await getDoc(docRef);
    return updatedDocSnap.exists() ? mapDocToProject(updatedDocSnap) : null;
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== "string") {
      console.error("ProjectRepository: delete called with invalid id:", id);
      return;
    }
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
  }
}
