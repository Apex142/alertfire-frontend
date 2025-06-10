// src/contexts/ProjectContext.tsx
"use client";
import { projectService } from "@/services/ProjectService";
import { Project } from "@/types/entities/Project";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ProjectContextType {
  project: Project | null;
  isLoading: boolean;
  error: Error | null;
  reloadProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx)
    throw new Error("useProjectContext must be used inside a ProjectProvider");
  return ctx;
};

export function ProjectProvider({
  children,
  projectId,
}: {
  children: ReactNode;
  projectId: string;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await projectService.getProjectById(projectId);
      if (!res) throw new Error("Projet introuvable.");
      setProject(res);
    } catch (e) {
      setProject(null);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchProject();
    // eslint-disable-next-line
  }, [projectId]);

  const value = {
    project,
    isLoading,
    error,
    reloadProject: fetchProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
