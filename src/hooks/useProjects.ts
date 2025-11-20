import { ProjectService } from "@/services/ProjectService";
import { Project } from "@/types/entities/Project";
import { useCallback, useEffect, useState } from "react";

/* util de tri sécurisé */
const sortByName = (a: Project, b: Project) =>
  (a.name ?? "").localeCompare(b.name ?? "");

const prepareProjects = (data: Project[]) =>
  data.filter((project) => !project.isDeleted).sort(sortByName);

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
      setProjects(prepareProjects(data));
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  }, []);

  /* --- temps réel --- */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const unsubscribe = ProjectService.subscribe(
      (data) => {
        if (cancelled) return;
        setProjects(prepareProjects(data));
        setLoading(false);
      },
      (e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error("Erreur inconnue"));
        setLoading(false);
      }
    );

    // Bootstrap fetch avoids hanging when the realtime channel is slow.
    (async () => {
      try {
        const data = await ProjectService.getAll();
        if (cancelled) return;
        setProjects(prepareProjects(data));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error("Erreur inconnue"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { projects, loading, error, refresh: fetchProjects };
}
