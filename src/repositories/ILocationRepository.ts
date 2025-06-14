import { Location } from "@/types/entities/Location";

export interface ILocationRepository {
  // CRUD pour une localisation de projet
  create(
    projectId: string,
    locationData: Omit<Location, "id" | "createdAt" | "updatedAt">
  ): Promise<Location>;
  findById(projectId: string, id: string): Promise<Location | null>;
  update(
    projectId: string,
    id: string,
    data: Partial<Location>
  ): Promise<Location | null>;
  delete(projectId: string, id: string): Promise<void>;
  findAll(projectId: string): Promise<Location[]>;

  // --- FONCTIONS GLOBALES ---
  // Création globale (hors projet)
  createGlobal(
    locationData: Omit<Location, "id" | "createdAt" | "updatedAt">
  ): Promise<Location>;

  // Lieux publics (hors projet, isPublic: true)
  findPublic(): Promise<Location[]>;

  // Lieux d’une entreprise (hors projet, companyId: string)
  findByCompany(companyId: string): Promise<Location[]>;
}
