// src/hooks/useProject.ts
import { db } from "@/lib/firebase";
import { Project } from "@/stores/useProjectData";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

// Tu peux réutiliser ou améliorer ton projectConverter ici si besoin.

export interface ProjectTechnician {
  id: string;
  [key: string]: any;
}

interface UseProjectOptions {
  realtime?: boolean;
}

export function useProject(
  projectId: string | undefined,
  options: UseProjectOptions = {}
) {
  const { realtime = false } = options;

  const [project, setProject] = useState<Project | null>(null);
  const [technicians, setTechnicians] = useState<ProjectTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setTechnicians([]);
      setLoading(false);
      setError(null);
      setNotFound(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);

    // --- Fetch Project ---
    let unsub: (() => void) | undefined;
    const projectRef = doc(db, "projects", projectId);

    const fetchProject = async () => {
      try {
        const snap = await getDoc(projectRef);
        if (!snap.exists()) {
          setProject(null);
          setNotFound(true);
        } else {
          setProject({ id: snap.id, ...snap.data() } as Project);
          setNotFound(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    if (realtime) {
      unsub = onSnapshot(
        projectRef,
        (snap) => {
          if (!snap.exists()) {
            setProject(null);
            setNotFound(true);
          } else {
            setProject({ id: snap.id, ...snap.data() } as Project);
            setNotFound(false);
          }
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    } else {
      fetchProject().finally(() => setLoading(false));
    }

    // --- Fetch Technicians ---
    const fetchTechnicians = async () => {
      try {
        const q = query(
          collection(db, "project_memberships"),
          where("projectId", "==", projectId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTechnicians(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchTechnicians();

    return () => {
      if (unsub) unsub();
    };
  }, [projectId, realtime]);

  return { project, technicians, loading, error, notFound };
}
