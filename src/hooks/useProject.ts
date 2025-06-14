import { db } from "@/lib/firebase/client";
import {
  HydratedTechnician,
  mergeMembershipsWithUsers,
} from "@/lib/utils/mergeMembershipsWithUsers";
import { projectService } from "@/services/ProjectService";
import { Project, ProjectDayEvent } from "@/types/entities/Project";
import { ProjectMembership } from "@/types/entities/ProjectMembership";
import { User } from "@/types/entities/User";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

type UseProjectResult = {
  project: Project | null;
  technicians: HydratedTechnician[];
  events: ProjectDayEvent[];
  loading: boolean;
  error: string | null;
  notFound: boolean;
};

export function useProject(projectId?: string): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [technicians, setTechnicians] = useState<HydratedTechnician[]>([]);
  const [events, setEvents] = useState<ProjectDayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setTechnicians([]);
      setEvents([]);
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      // 1. Projet principal (via service)
      const loadedProject = await projectService.getProjectById(projectId);
      if (!loadedProject) {
        setProject(null);
        setTechnicians([]);
        setEvents([]);
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProject(loadedProject);

      // 2. Events du planning
      let allEvents: ProjectDayEvent[] = [];
      if (Array.isArray(loadedProject.dayPlannings)) {
        allEvents = loadedProject.dayPlannings.flatMap((planning) =>
          Array.isArray(planning.events) ? planning.events : []
        );
      }
      setEvents(allEvents);

      // 3. Récupère memberships (via service)
      const memberships: ProjectMembership[] =
        await projectService.getProjectMemberships(projectId);

      // 4. Récupère users (direct DB: pas dans ProjectService pour éviter complexité)
      const userIds = memberships.map((m) => m.userId);
      const users: User[] = [];
      const chunkSize = 10;
      for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        if (!chunk.length) continue;
        const userQuery = query(
          collection(db, "users"),
          where("uid", "in", chunk)
        );
        const userSnap = await getDocs(userQuery);
        users.push(...userSnap.docs.map((d) => d.data() as User));
      }

      // 5. Fusion memberships + infos user (hydrated)
      setTechnicians(mergeMembershipsWithUsers(memberships, users));
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
