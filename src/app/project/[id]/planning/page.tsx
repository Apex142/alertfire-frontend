// src/features/project/planning/PlanningPageWrapper.tsx

"use client";

import { Loading } from "@/components/ui/Loading";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Layout from "../layout";
import { useActiveProjectStore } from "../useActiveProjectStore";
import PlanningPage from "./PlanningPage";

interface PlanningPageWrapperProps {
  projectId: string;
}

export default function PlanningPageWrapper({
  projectId,
}: PlanningPageWrapperProps) {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const { project, isLoading, error, setActiveProject } =
    useActiveProjectStore();

  const initRef = useRef(false);
  const initializationRef = useRef<Promise<void> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh de PlanningPage

  // Initialise le projet une seule fois
  useEffect(() => {
    if (!projectId || initRef.current) return;

    const initProject = async () => {
      if (initializationRef.current) return;
      try {
        initializationRef.current = setActiveProject(projectId);
        await initializationRef.current;
        initRef.current = true;
      } catch (err) {
        initializationRef.current = null;
      }
    };

    initProject();

    return () => {
      // Reset si changement de page ou unmount
      initRef.current = false;
      initializationRef.current = null;
    };
  }, [projectId, setActiveProject]);

  // Gestion des erreurs et retry/backoff
  useEffect(() => {
    if (!error || !projectId || retryCount >= 3) return;

    if (
      error.message?.toLowerCase?.().includes("not found") ||
      error.message?.toLowerCase?.().includes("non trouvé")
    ) {
      router.push("/projects?error=project-not-found");
      return;
    }

    // Retry progressif
    const timer = setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      setActiveProject(projectId);
    }, 1000 * (retryCount + 1));
    return () => clearTimeout(timer);
  }, [error, projectId, retryCount, router, setActiveProject]);

  // Fonction de refresh à passer à PlanningPage
  const refreshEvents = useCallback(async () => {
    // Peut déclencher un refresh dans useActiveProjectStore, ou forcer un refresh du composant enfant
    // Ici, on force juste le refresh du composant enfant
    setRefreshKey((k) => k + 1);
    // Ou, si tu exposes un reload dans le store : await reloadProject(projectId);
  }, [projectId]);

  // Séquence d’affichage
  let content: React.ReactNode = null;

  if (isLoading) {
    content = (
      <div className="flex items-center justify-center min-h-screen">
        <Loading
          message={
            retryCount > 0
              ? `Nouvelle tentative (${retryCount}/3)...`
              : "Chargement du projet..."
          }
          size="lg"
        />
      </div>
    );
  } else if (error && retryCount >= 3) {
    content = (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <div className="text-red-500 text-xl mb-4 font-bold">
          Une erreur est survenue lors du chargement du projet
        </div>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              setRetryCount(0);
              initRef.current = false;
              setActiveProject(projectId);
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push("/projects")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Retourner à la liste des projets
          </button>
        </div>
      </div>
    );
  } else if (!project && !isLoading) {
    // Fin du chargement mais projet null
    content = (
      <div className="flex items-center justify-center min-h-screen">
        Projet introuvable.
      </div>
    );
  } else if (project) {
    // Succès : passe project et refreshEvents à PlanningPage, et refreshKey pour forcer update
    content = (
      <PlanningPage
        key={refreshKey}
        project={project}
        refreshEvents={refreshEvents}
        loading={isLoading}
      />
    );
  }

  // Si pas encore d’ID projet, ne pas wrapper dans Layout
  if (!project?.id) {
    return content;
  }

  // Projet chargé : affichage avec Layout du projet
  return <Layout params={{ id: project.id }}>{content}</Layout>;
}
