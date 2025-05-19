'use client';

import { create } from 'zustand';
import { Project } from '@/types/project';
import { doc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isEqual } from 'lodash';

interface ActiveProjectState {
  projectId: string | null;
  project: Project | null;
  isLoading: boolean;
  error: Error | null;
  unsubscribe: Unsubscribe | null;
  setActiveProject: (projectId: string) => Promise<void>;
  clearActiveProject: () => void;
}

let unsubscribeListener: Unsubscribe | null = null;
let currentProjectId: string | null = null;

export const useActiveProjectStore = create<ActiveProjectState>((set, get) => ({
  projectId: null,
  project: null,
  isLoading: false,
  error: null,
  unsubscribe: null,

  setActiveProject: async (projectId: string) => {
    // Si on écoute déjà ce projet et qu'il est chargé, ne rien faire
    if (currentProjectId === projectId && get().project) {
      return;
    }

    // Nettoyer l'ancienne souscription si elle existe
    if (unsubscribeListener) {
      unsubscribeListener();
      unsubscribeListener = null;
    }

    try {
      currentProjectId = projectId;
      set({ projectId, isLoading: true, error: null });

      // Vérifier d'abord si le projet existe
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        currentProjectId = null;
        set({
          project: null,
          isLoading: false,
          error: new Error('Projet non trouvé')
        });
        return;
      }

      // Si le projet existe, démarrer l'écoute en temps réel
      let isFirstUpdate = true;
      unsubscribeListener = onSnapshot(
        docRef,
        (doc) => {
          if (doc.exists()) {
            const projectData = {
              id: doc.id,
              ...doc.data()
            } as Project;

            // Ne mettre à jour que si les données ont changé
            const currentProject = get().project;
            if (isFirstUpdate || !isEqual(currentProject, projectData)) {
              set({ project: projectData, isLoading: false, error: null });
            }
            isFirstUpdate = false;
          } else {
            currentProjectId = null;
            set({
              project: null,
              isLoading: false,
              error: new Error('Projet non trouvé')
            });
          }
        },
        (error) => {
          console.error('Erreur de surveillance du projet:', error);
          currentProjectId = null;
          set({
            isLoading: false,
            error: new Error('Erreur lors du chargement du projet')
          });
        }
      );

      set({ unsubscribe: unsubscribeListener });

    } catch (error) {
      console.error('Erreur lors de l\'initialisation du projet:', error);
      currentProjectId = null;
      set({
        project: null,
        isLoading: false,
        error: new Error('Erreur lors du chargement du projet')
      });
    }
  },

  clearActiveProject: () => {
    if (unsubscribeListener) {
      unsubscribeListener();
      unsubscribeListener = null;
    }
    currentProjectId = null;
    set({
      projectId: null,
      project: null,
      isLoading: false,
      error: null,
      unsubscribe: null
    });
  }
}));

// Hook pour utiliser le store avec une API plus simple
export function useActiveProject() {
  const store = useActiveProjectStore();
  return {
    project: store.project,
    isLoading: store.isLoading,
    error: store.error,
    setActiveProject: store.setActiveProject,
    clearActiveProject: store.clearActiveProject,
  };
} 