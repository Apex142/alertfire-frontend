'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useActiveProject } from '@/stores/useActiveProjectStore';
import { Loading } from '@/components/ui/Loading';
import { redirect } from 'next/navigation';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { useState } from 'react';

interface ProjectContextData extends ReturnType<typeof useActiveProject> {
  events: Event[];
  loadingEvents: boolean;
  refreshEvents: () => Promise<void>;
}

export const ProjectContext = createContext<ProjectContextData | null>(null);

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext doit être utilisé dans un ProjectProvider');
  }
  return context;
}

interface ProjectProviderProps {
  children: ReactNode;
  projectId: string;
}

export function ProjectProvider({ children, projectId }: ProjectProviderProps) {
  const projectData = useActiveProject();
  const { project, isLoading, error, setActiveProject } = projectData;
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Charger le projet
  useEffect(() => {
    setActiveProject(projectId);
  }, [projectId, setActiveProject]);

  // Charger les événements du projet
  const loadEvents = async () => {
    if (!project) return;

    try {
      setLoadingEvents(true);
      const eventsRef = collection(db, 'projects', project.id, 'events');
      const eventsQuery = query(eventsRef);
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(eventsData);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (project) {
      loadEvents();
    }
  }, [project]);

  // Afficher le loading pendant le chargement initial
  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading
          message="Chargement du projet..."
          size="lg"
        />
      </div>
    );
  }

  // Rediriger vers 404 uniquement si une erreur est explicitement définie
  if (error) {
    redirect('/404');
  }

  return (
    <ProjectContext.Provider
      value={{
        ...projectData,
        events,
        loadingEvents,
        refreshEvents: loadEvents
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
} 