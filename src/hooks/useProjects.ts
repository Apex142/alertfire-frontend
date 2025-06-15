import { ProjectService } from "@/services/ProjectService";
import { Project } from "@/types/entities/Project";
import { useCallback, useEffect, useState } from "react";

/* util de tri sécurisé */
const sortByName = (a: Project, b: Project) =>
  (a.name ?? "").localeCompare(b.name ?? "");

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /* --- fetch manuel --- */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProjectService.getAll();
      setProjects(data.filter((p) => !p.isDeleted).sort(sortByName));
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  }, []);

  /* --- temps réel --- */
  useEffect(() => {
    setLoading(true);

    const unsubscribe = ProjectService.subscribe(
      (data) => {
        setProjects(data.filter((p) => !p.isDeleted).sort(sortByName));
        setLoading(false);
      },
      (e) => {
        setError(e instanceof Error ? e : new Error("Erreur inconnue"));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { projects, loading, error, refresh: fetchProjects };
}
