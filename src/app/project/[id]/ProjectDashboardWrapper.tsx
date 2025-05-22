"use client";

import { Loading } from "@/components/ui/Loading";
import ProjectDashboardClient from "@/features/project/dashboard/ProjectDashboardClient";
import { useActiveProject } from "@/stores/useActiveProjectStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ProjectDashboardWrapperProps {
  projectId: string;
}

export default function ProjectDashboardWrapper({
  projectId,
}: ProjectDashboardWrapperProps) {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const { project, isLoading, error, setActiveProject } = useActiveProject();
  const initRef = useRef(false);
  const initializationRef = useRef<Promise<void> | null>(null);

  // Effet pour initialiser le project une seule fois
  useEffect(() => {
    if (!projectId || initRef.current) return;

    const initProject = async () => {
      if (initializationRef.current) return;

      try {
        initializationRef.current = setActiveProject(projectId);
        await initializationRef.current;
        initRef.current = true;
      } catch (err) {
        console.error("Error initializing project:", err);
        initializationRef.current = null;
      }
    };

    initProject();

    return () => {
      initRef.current = false;
      initializationRef.current = null;
    };
  }, [projectId, setActiveProject]);

  // Effet pour gérer les erreurs et les retries
  useEffect(() => {
    if (!error || !projectId || retryCount >= 3) return;

    if (error.message === "project non trouvé") {
      router.push("/projects?error=project-not-found");
      return;
    }

    const timer = setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      setActiveProject(projectId);
    }, 1000 * (retryCount + 1)); // Exponential backoff

    return () => clearTimeout(timer);
  }, [error, projectId, retryCount, router, setActiveProject]);

  if (!projectId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading
          message={
            retryCount > 0
              ? `Nouvelle tentative (${retryCount}/3)...`
              : "Chargement du project..."
          }
          size="lg"
        />
      </div>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">
          Une erreur est survenue lors du chargement du project
        </div>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <div className="space-x-4">
          <button
            onClick={() => {
              setRetryCount(0);
              initRef.current = false;
              setActiveProject(projectId);
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push("/projects")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Retourner à la liste des projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return <ProjectDashboardClient project={project} />;
}
