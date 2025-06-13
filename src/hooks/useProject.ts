import { db } from "@/lib/firebase/client";
import {
  HydratedTechnician,
  mergeMembershipsWithUsers,
} from "@/lib/utils/mergeMembershipsWithUsers";
import { Project, ProjectDayEvent } from "@/types/entities/Project";
import { ProjectMembership } from "@/types/entities/ProjectMembership";
import { User } from "@/types/entities/User";

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
      // 1. Project
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

      // 2. Events from dayPlannings
      let allEvents: ProjectDayEvent[] = [];
      if (Array.isArray(projectData.dayPlannings)) {
        allEvents = projectData.dayPlannings.flatMap((planning) =>
          Array.isArray(planning.events) ? planning.events : []
        );
      }
      setEvents(allEvents);

      // 3. Memberships (technicians)
      const techQuery = query(
        collection(db, "project_memberships"),
        where("projectId", "==", projectId)
      );
      const techSnap = await getDocs(techQuery);
      const memberships: ProjectMembership[] = techSnap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as ProjectMembership)
      );

      // 4. Users (corresponding to memberships)
      const userIds = memberships.map((m) => m.userId);
      // Firebase where("uid", "in", ...) max 10, donc faire en plusieurs fois si besoin
      const users: User[] = [];
      const chunkSize = 10;
      for (let i = 0; i < userIds.length; i += chunkSize) {
        const idsChunk = userIds.slice(i, i + chunkSize);
        if (idsChunk.length === 0) continue;
        const userQuery = query(
          collection(db, "users"),
          where("uid", "in", idsChunk)
        );
        const userSnap = await getDocs(userQuery);
        users.push(...userSnap.docs.map((doc) => doc.data() as User));
      }

      // 5. Merge memberships + users
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
