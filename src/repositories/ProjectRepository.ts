// src/repositories/ProjectRepository.ts
import { db } from "@/lib/firebase/client";
import { Project, ProjectDayPlanning } from "@/types/entities/Project";
import { ProjectPrivacy } from "@/types/enums/ProjectPrivacy";
import { ProjectStatus } from "@/types/enums/ProjectStatus";
import {
  DocumentData,
  DocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { IProjectRepository } from "./IProjectRepository";

/** Utility pour parser dayPlannings */
function mapFirestoreDayPlannings(data: any): ProjectDayPlanning[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map((planning: any) => ({
    date: typeof planning.date === "string" ? planning.date : "",
    events: Array.isArray(planning.events)
      ? planning.events.map((event: any) => ({
          id: event.id || "",
          label: event.label || "",
          description: event.description || "",
          type: event.type || "",
          location: event.location || "",
          startTime: event.startTime,
          endTime: event.endTime,
        }))
      : [],
  }));
}

const PROJECTS_COLLECTION = "projects";

const mapDocToProject = (docSnap: DocumentSnapshot<DocumentData>): Project => {
  const data = docSnap.data();
  if (!data)
    throw new Error(`No data found for project document ${docSnap.id}`);

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
    privacy: data.privacy as ProjectPrivacy,
    status: data.status as ProjectStatus,
    archived: data.archived || false,
    deleted: data.deleted || false,
    coverImageUrl: data.coverImageUrl || null,
    membersCount: data.membersCount || 0,
    tags: data.tags || [],
    dayPlannings: mapFirestoreDayPlannings(data.dayPlannings), // robust here
  };
};

export class ProjectRepository implements IProjectRepository {
  private projectsCollectionRef = collection(db, PROJECTS_COLLECTION);

  async findById(id: string): Promise<Project | null> {
    if (!id || typeof id !== "string") return null;
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
    // Toujours dayPlannings: []
    const docRef = await addDoc(this.projectsCollectionRef, {
      ...data,
      dayPlannings: data.dayPlannings || [],
    });
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
    if (!id || typeof id !== "string") return null;
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await updateDoc(docRef, data);
    const updatedDocSnap = await getDoc(docRef);
    return updatedDocSnap.exists() ? mapDocToProject(updatedDocSnap) : null;
  }

  async upsertDayPlanning(
    projectId: string,
    dayPlanning: ProjectDayPlanning
  ): Promise<Project | null> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projectSnap = await getDoc(docRef);
    if (!projectSnap.exists()) return null;
    const project = mapDocToProject(projectSnap);

    const newDayPlannings = [
      ...(project.dayPlannings || []).filter(
        (p) => p.date !== dayPlanning.date
      ),
      dayPlanning,
    ];
    await updateDoc(docRef, { dayPlannings: newDayPlannings });
    const updatedSnap = await getDoc(docRef);
    return updatedSnap.exists() ? mapDocToProject(updatedSnap) : null;
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== "string") return;
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
  }
}
