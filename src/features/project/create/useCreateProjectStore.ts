// src/features/projects/create/useCreateProjectStore.ts
import { ProjectPrivacy } from "@/types/enums/ProjectPrivacy";
import { ProjectStatus } from "@/types/enums/ProjectStatus";
import { create } from "zustand";

// Couleurs HEX utilisées dans Step1
export const COLORS_HEX = [
  "#AD1457",
  "#D50000",
  "#F4511E",
  "#E67C73",
  "#F6BF26",
  "#33B679",
  "#0B8043",
  "#039BE5",
  "#3F51B5",
  "#7986CB",
  "#8E24AA",
  "#616161",
];

// Interface pour les données stockées, alignée sur les champs nécessaires pour Project, utilisant des types JS natifs
export interface CreateProjectStoreData {
  projectName?: string;
  acronym?: string | null;
  description?: string | null; // A remplacé shortDescription pour correspondre à l'entité Project
  color?: string; // HEX string, ex: "#AD1457"
  startDate?: Date | null;
  endDate?: Date | null;
  status?: ProjectStatus;
  tags?: string | null; // Chaîne de tags séparés par des virgules, sera parsée plus tard

  // Données de l'étape 2
  companyId?: string | null;
  privacy?: ProjectPrivacy;
}

interface CreateProjectStoreState {
  data: CreateProjectStoreData;
  setData: (newData: Partial<CreateProjectStoreData>) => void;
  resetData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const sevenDaysFromNow = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};

const initialState: CreateProjectStoreData = {
  projectName: "",
  acronym: null,
  description: null,
  color: COLORS_HEX[0],
  startDate: new Date(),
  endDate: sevenDaysFromNow(),
  tags: null,
  companyId: "", // DOIT ÊTRE null ou ""
  privacy: undefined, // ou null/undefined si tu veux forcer la sélection
  status: ProjectStatus.TO_BE_CONFIRMED,
};

export const useCreateProjectStore = create<CreateProjectStoreState>((set) => ({
  data: initialState,
  setData: (newData) =>
    set((state) => ({ data: { ...state.data, ...newData } })),
  resetData: () => set({ data: initialState, currentStep: 1 }),
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),
}));
