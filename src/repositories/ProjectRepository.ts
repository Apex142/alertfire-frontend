import { db } from "@/lib/firebase/client";
import { Project } from "@/types/entities/Project";
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
import { IProjectRepository } from "./IProjectRepository";

const COLLECTION = "projects";

export class ProjectRepository implements IProjectRepository {
  /* ---------- R/W classiques ---------- */
  async getAll(): Promise<Project[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
  }

  async getById(id: string): Promise<Project | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Project) : null;
  }

  async create(project: Project): Promise<void> {
    await setDoc(doc(db, COLLECTION, project.id), project);
  }

  async update(id: string, project: Partial<Project>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), project);
  }

  async delete(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { isDeleted: true });
  }

  /* ---------- TEMPS RÉEL ---------- */
  onSnapshot(
    cb: (projects: Project[]) => void,
    err?: (e: Error) => void
  ): () => void {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      (snap: QuerySnapshot) => {
        const projects = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Project)
        );
        cb(projects);
      },
      err
    );

    return unsubscribe;
  }
}
