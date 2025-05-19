import { create } from 'zustand';

export type ProjectStatus = 'Confirmé' | 'Optionnel';
export type ProjectPrivacy = 'public' | 'privé';

export interface CreateProjectData {
  // Étape 1 - Informations générales
  projectName: string;
  acronym?: string;
  status: ProjectStatus;
  color: string;
  startDate: Date;
  endDate: Date;

  // Étape 2 - Entreprise et confidentialité
  companyId: string;
  privacy: ProjectPrivacy;
}

interface CreateProjectStore {
  data: Partial<CreateProjectData>;
  setData: (values: Partial<CreateProjectData>) => void;
  reset: () => void;
}

export const useCreateProjectStore = create<CreateProjectStore>((set) => ({
  data: {},
  setData: (values) => set((state) => ({ data: { ...state.data, ...values } })),
  reset: () => set({ data: {} }),
})); 