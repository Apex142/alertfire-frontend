"use client";

import { Layout } from "@/components/layout/Layout";
import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import { useCallback, useEffect, useMemo, useState } from "react"; // useMemo ajouté

import {
  CalendarOption,
  SidebarCalendarList,
} from "../../components/dashboard/SidebarCalendarList";

// TODO: Ajustez ce chemin d'importation pour qu'il corresponde à l'emplacement réel
import { Project } from "@/types/entities/Project";
import CustomProjectScheduler from "../../components/dashboard/CustomProjectScheduler";

const STATIC_CALENDARS: Omit<CalendarOption, "label" | "checked">[] = [
  { id: "multiviews", color: "bg-purple-500" },
  { id: "multiviews_sec", color: "bg-yellow-500" },
];

export default function DashboardPage() {
  const { appUser, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, error } = useProjects();

  const [showCalendars, setShowCalendars] = useState(true); // État pour la visibilité de la liste des calendriers dans la sidebar
  const [calendars, setCalendars] = useState<CalendarOption[]>([]);

  // Calculer les activeCalendarIds une seule fois par rendu si calendars change
  const activeCalendarIds = useMemo(() => {
    return calendars.filter((c) => c.checked).map((c) => c.id);
  }, [calendars]);

  useEffect(() => {
    const personalCalendarLabel =
      appUser?.displayName || appUser?.email || "Personnel";
    const initialPersonalCal: CalendarOption = {
      id: "personal",
      label: personalCalendarLabel,
      color: "bg-blue-500",
      checked: true,
    };

    const projectBasedCalendars: CalendarOption[] = (projects || []).map(
      (project: Project) => ({
        id: project.id,
        label: project.projectName,
        color: project.color || "bg-gray-500",
        checked: true,
      })
    );

    const defaultStaticCalendars: CalendarOption[] = STATIC_CALENDARS.map(
      (cal) => ({
        ...cal,
        label:
          cal.id === "multiviews" ? "Multiviews Projets" : "Multiviews Tâches",
        checked: true,
      })
    );

    setCalendars([
      initialPersonalCal,
      ...projectBasedCalendars,
      ...defaultStaticCalendars,
    ]);
  }, [appUser, projects]);

  const handleProjectClick = useCallback((projectId: string) => {
    console.log("Projet cliqué dans le scheduler :", projectId);
    // Ajoutez votre logique de navigation ou d'affichage de détails ici
  }, []);

  const handleToggleCalendar = useCallback((id: string) => {
    setCalendars((prev) =>
      prev.map((cal) =>
        cal.id === id ? { ...cal, checked: !cal.checked } : cal
      )
    );
  }, []);

  const handleToggleShowCalendars = useCallback(() => {
    setShowCalendars((prev) => !prev);
  }, []);

  if (authLoading || projectsLoading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <Loading message="Chargement de votre tableau de bord..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400">
            Une erreur est survenue
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Conteneur flex principal pour la sidebar et le contenu main */}
      <div className="flex h-full">
        <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 md:block">
          <SidebarCalendarList
            calendars={calendars}
            showCalendars={showCalendars} // Ce prop contrôle-t-il l'affichage de la liste à l'intérieur de la sidebar ?
            onToggleShow={handleToggleShowCalendars}
            onToggleCalendar={handleToggleCalendar}
          />
        </aside>

        {/* Main content area:
          - flex-1: prend l'espace horizontal restant.
          - flex flex-col: organise ses enfants (titre, scheduler) verticalement.
          - overflow-hidden: important pour que le scroll soit géré par le contenu interne si besoin.
        */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 min-h-0 p-4 pt-0 md:p-6 md:pt-0">
            {/* Le CustomProjectScheduler devrait être conçu pour prendre h-full */}
            {(projects && projects.length > 0) ||
            activeCalendarIds.includes("personal") ? (
              <CustomProjectScheduler
                projects={projects || []}
                onProjectClick={handleProjectClick}
                activeCalendars={activeCalendarIds}
                // Assurez-vous que CustomProjectScheduler a className="h-full" ou une logique similaire
                // pour remplir l'espace de ce conteneur.
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-white p-6 text-center shadow dark:bg-gray-800">
                <div>
                  {" "}
                  {/* Div supplémentaire pour un meilleur contrôle du centrage vertical du texte */}
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    Aucun projet à afficher
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Créez un projet pour commencer à planifier ou activez des
                    calendriers dans la barre latérale.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
