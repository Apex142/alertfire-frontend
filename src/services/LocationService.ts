// src/services/LocationService.ts

import { ILocationRepository } from "@/repositories/ILocationRepository";
import { LocationRepository } from "@/repositories/LocationRepository";
import { Location } from "@/types/entities/Location";
import { serverTimestamp, Timestamp } from "firebase/firestore";

export class LocationService {
  private locationRepository: ILocationRepository;

  constructor(repository?: ILocationRepository) {
    this.locationRepository = repository || new LocationRepository();
  }

  /**
   * Crée une nouvelle localisation dans un projet
   * @param projectId id du projet concerné
   */
  async createLocation(
    projectId: string,
    data: Omit<Location, "id" | "createdAt" | "updatedAt">
  ): Promise<Location> {
    return this.locationRepository.create(projectId, data);
  }

  /**
   * Crée une localisation "globale" (publique ou company) HORS projet (pour la bibliothèque globale)
   */
  async createGlobalLocation(
    data: Omit<Location, "id" | "createdAt" | "updatedAt">
  ): Promise<Location> {
    // Ici, le repo doit écrire dans "locations" (collection globale)
    return this.locationRepository.createGlobal(data);
  }

  /** Met à jour une localisation d’un projet */
  async updateLocation(
    projectId: string,
    id: string,
    data: Partial<Location>
  ): Promise<Location | null> {
    // Ajoute updatedAt
    const payload = {
      ...data,
      updatedAt: serverTimestamp() as Timestamp,
    };
    return this.locationRepository.update(projectId, id, payload);
  }

  /** Supprime une localisation d’un projet */
  async deleteLocation(projectId: string, id: string): Promise<void> {
    await this.locationRepository.delete(projectId, id);
  }

  /** Récupère une localisation d’un projet par son id */
  async getLocationById(
    projectId: string,
    id: string
  ): Promise<Location | null> {
    return this.locationRepository.findById(projectId, id);
  }

  /** Récupère toutes les localisations du projet */
  async getAllLocations(projectId: string): Promise<Location[]> {
    return this.locationRepository.findAll(projectId);
  }

  /** Liste toutes les localisations PUBLIQUES (global) */
  async getPublicLocations(): Promise<Location[]> {
    // Utilise la collection globale
    return this.locationRepository.findPublic();
  }

  /** Liste toutes les localisations d’une entreprise (global, HORS projet) */
  async getCompanyLocations(companyId: string): Promise<Location[]> {
    return this.locationRepository.findByCompany(companyId);
  }

  /** Marque une localisation comme légitime (exemple d’enrichissement) */
  async markAsLegit(
    projectId: string,
    id: string,
    validatorId: string
  ): Promise<Location | null> {
    // Ajoute l’utilisateur dans l’historique si besoin
    return this.updateLocation(projectId, id, {
      isLegit: true,
      // Possibilité: modificationHistory
    });
  }

  /** Ajoute une note à une localisation du projet */
  async addNote(
    projectId: string,
    id: string,
    note: string,
    userId: string
  ): Promise<Location | null> {
    // Possibilité d’enrichir modificationHistory ici aussi
    return this.updateLocation(projectId, id, {
      notes: note,
    });
  }
}

// Singleton prêt à l’emploi
export const locationService = new LocationService();
