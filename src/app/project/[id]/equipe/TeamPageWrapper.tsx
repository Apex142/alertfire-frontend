// src/features/project/team/TeamPageWrapper.tsx

"use client";

import { Loading } from "@/components/ui/Loading"; // Assurez-vous que le chemin est correct
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useActiveProjectStore } from "../useActiveProjectStore";
import TeamView from "./TeamView";
import Layout from "../layout";

interface TeamPageWrapperProps {
  projectId: string;
}

export default function TeamPageWrapper({ projectId }: TeamPageWrapperProps) {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const { project, isLoading, error, setActiveProject } =
    useActiveProjectStore();

  // Refs pour garantir une initialisation unique
  const initRef = useRef(false);
  const initializationRef = useRef<Promise<void> | null>(null);

  // Effet pour initialiser le projet une seule fois
  useEffect(() => {
    if (!projectId || initRef.current) return;

    const initProject = async () => {
      if (initializationRef.current) return;
      try {
        console.log(`TeamPageWrapper: Initializing project ${projectId}`);
        initializationRef.current = setActiveProject(projectId);
        await initializationRef.current;
        initRef.current = true;
      } catch (err) {
        console.error("Error initializing project in Wrapper:", err);
        initializationRef.current = null; // Permet une nouvelle tentative
      }
    };

    initProject();

    // Nettoyage pour les changements de page
    return () => {
      initRef.current = false;
      initializationRef.current = null;
    };
  }, [projectId, setActiveProject]);

  // Effet pour gérer les erreurs et les nouvelles tentatives
  useEffect(() => {
    if (!error || !projectId || retryCount >= 3) return;

    if (
      error.message.includes("not found") ||
      error.message.includes("non trouvé")
    ) {
      router.push("/projects?error=project-not-found");
      return;
    }

    // Logique de backoff exponentiel pour les nouvelles tentatives
    const timer = setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      setActiveProject(projectId);
    }, 1000 * (retryCount + 1));

    return () => clearTimeout(timer);
  }, [error, projectId, retryCount, router, setActiveProject]);

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
  } else if (!project) {
    // Cas où le chargement est terminé mais le projet est null (ex: non trouvé sans erreur)
    content = (
      <div className="flex items-center justify-center min-h-screen">
        Projet introuvable.
      </div>
    );
  } else {
    // Succès ! On rend la vue principale de l'équipe.
    content = <TeamView />;
  }

  // Si le projet n'a pas encore d'ID, on ne peut pas rendre le Layout.
  // On affiche donc directement le contenu (loading, error, etc.).
  if (!project?.id) {
    return content;
  }

  // Une fois le projet chargé, on enveloppe le contenu dans le Layout du projet.
  return <Layout params={{ id: project.id }}>{content}</Layout>;
}
