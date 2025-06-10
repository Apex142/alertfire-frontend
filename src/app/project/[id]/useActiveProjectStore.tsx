// src/stores/useActiveProjectStore.ts
import { projectService } from "@/services/ProjectService"; // Assurez-vous que ce chemin est correct
import { Project } from "@/types/entities/Project";
import { create } from "zustand";

interface ActiveProjectState {
  project: Project | null;
  isLoading: boolean;
  error: Error | null;
  setActiveProject: (projectId: string) => Promise<void>; // Retourne une promesse pour que l'appelant puisse l'attendre
  clearActiveProject: () => void;
}

const initialState = {
  project: null,
  isLoading: false, // Commencer à false, le chargement est déclenché par setActiveProject
  error: null,
};

export const useActiveProjectStore = create<ActiveProjectState>((set, get) => ({
  ...initialState,

  /**
   * Charge un projet par son ID et met à jour l'état du store.
   * Gère les états de chargement et d'erreur.
   */
  setActiveProject: async (projectId: string) => {
    if (!projectId) {
      console.warn("setActiveProject: projectId is missing.");
      set({
        project: null,
        isLoading: false,
        error: new Error("ID de projet manquant."),
      });
      return;
    }

    // Si on charge déjà ce projet, ou si le projet est déjà chargé et correspond à l'ID demandé
    if (get().isLoading && get().project?.id === projectId) {
      console.log(
        `setActiveProject: Already loading or project ${projectId} is already active and loading.`
      );
      return;
    }
    if (!get().isLoading && get().project?.id === projectId) {
      console.log(
        `setActiveProject: Project ${projectId} is already active. No fetch needed.`
      );
      // Optionnel: Forcer isLoading à false au cas où il serait resté à true par erreur.
      // set({ isLoading: false, error: null });
      return;
    }

    console.log(
      `useActiveProjectStore: Setting active project - ID: ${projectId}`
    );
    set({ isLoading: true, error: null, project: null }); // Réinitialiser le projet en attendant le nouveau

    try {
      const fetchedProject = await projectService.getProjectById(projectId);
      if (fetchedProject) {
        console.log(
          `useActiveProjectStore: Project ${projectId} fetched successfully.`
        );
        set({ project: fetchedProject, isLoading: false, error: null });
      } else {
        console.warn(`useActiveProjectStore: Project ${projectId} not found.`);
        set({
          project: null,
          isLoading: false,
          error: new Error("project non trouvé"), // Message d'erreur spécifique attendu par ProjectDashboardWrapper
        });
      }
    } catch (err) {
      console.error(
        `useActiveProjectStore: Error fetching project ${projectId}:`,
        err
      );
      const fetchingError =
        err instanceof Error
          ? err
          : new Error("Erreur inconnue lors du chargement du projet.");
      set({ project: null, isLoading: false, error: fetchingError });
      // L'erreur est stockée dans le state, ProjectDashboardWrapper la gérera.
      // Pas besoin de la relancer ici, sauf si le contrat de la promesse doit être une réjection.
      // Pour que `await initializationRef.current;` dans le wrapper ne lève pas d'erreur non gérée,
      // cette promesse devrait se résoudre. Le wrapper vérifiera ensuite `store.error`.
    }
  },

  /**
   * Réinitialise l'état du projet actif.
   */
  clearActiveProject: () => {
    console.log("useActiveProjectStore: Clearing active project.");
    set(initialState);
  },
}));
