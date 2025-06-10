import { db } from "@/lib/firebase/client";
import { Project, ProjectDayEvent } from "@/types/entities/Project";
import { ProjectMembership } from "@/types/entities/ProjectMembership";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

type UseProjectResult = {
  project: Project | null;
  technicians: ProjectMembership[];
  events: ProjectDayEvent[]; // Ajouté ici
  loading: boolean;
  error: string | null;
  notFound: boolean;
};

/**
 * Récupère le projet, les membres techniques et les events du planning d'un projet Firestore.
 */
export function useProject(projectId?: string): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [technicians, setTechnicians] = useState<ProjectMembership[]>([]);
  const [events, setEvents] = useState<ProjectDayEvent[]>([]); // Ajouté
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setEvents([]);
      setTechnicians([]);
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      // 1. Fetch project
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        setNotFound(true);
        setProject(null);
        setEvents([]);
        setTechnicians([]);
        setLoading(false);
        return;
      }
      const projectData = {
        id: projectSnap.id,
        ...projectSnap.data(),
      } as Project;
      setProject(projectData);

      // 2. Extract all events from dayPlannings (if exists)
      let allEvents: ProjectDayEvent[] = [];
      if (Array.isArray(projectData.dayPlannings)) {
        allEvents = projectData.dayPlannings.flatMap((planning) =>
          Array.isArray(planning.events) ? planning.events : []
        );
      }
      setEvents(allEvents);

      // 3. Fetch technicians
      const techQuery = query(
        collection(db, "project_memberships"),
        where("projectId", "==", projectId),
        where("role", "==", "technician") // à ajuster selon tes rôles
      );
      const techSnap = await getDocs(techQuery);
      setTechnicians(
        techSnap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as ProjectMembership)
        )
      );
    } catch (err: any) {
      setError(err?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return { project, technicians, events, loading, error, notFound };
}
