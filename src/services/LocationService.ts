import { ILocationRepository } from "@/repositories/ILocationRepository";
import { LocationRepository } from "@/repositories/LocationRepository";
import { Location } from "@/types/entities/Location";
import { serverTimestamp, Timestamp } from "firebase/firestore";

export class LocationService {
  private locationRepository: ILocationRepository;

  constructor(repository?: ILocationRepository) {
    this.locationRepository = repository || new LocationRepository();
  }

  /** Crée une nouvelle localisation */
  async createLocation(
    data: Omit<Location, "id" | "createdAt" | "updatedAt">
  ): Promise<Location> {
    return this.locationRepository.create(data);
  }

  /** Met à jour une localisation (avec gestion de la date de modification) */
  async updateLocation(
    id: string,
    data: Partial<Location>
  ): Promise<Location | null> {
    // On force la mise à jour du champ updatedAt côté service
    const payload = {
      ...data,
      updatedAt: serverTimestamp() as Timestamp,
    };
    return this.locationRepository.update(id, payload);
  }

  /** Supprime une localisation */
  async deleteLocation(id: string): Promise<void> {
    await this.locationRepository.delete(id);
  }

  /** Récupère une localisation par son id */
  async getLocationById(id: string): Promise<Location | null> {
    return this.locationRepository.findById(id);
  }

  /** Récupère toutes les localisations créées par un utilisateur */
  async getLocationsByCreator(userId: string): Promise<Location[]> {
    return this.locationRepository.findByCreator(userId);
  }

  /** Liste toutes les localisations publiques */
  async getPublicLocations(): Promise<Location[]> {
    return this.locationRepository.findPublic();
  }

  // ---- Méthodes métier potentielles à ajouter (exemples) ----

  /** Marque une localisation comme "légitime" après vérification */
  async markAsLegit(id: string, validatorId: string): Promise<Location | null> {
    return this.updateLocation(id, {
      isLegit: true,
      // tu pourrais loguer qui a validé dans modificationHistory
    });
  }

  /** Récupère toutes les localisations d'une entreprise */
  async getCompanyLocations(companyId: string): Promise<Location[]> {
    return this.locationRepository.findByCompany(companyId);
  }

  /** Ajoute une note à une localisation */
  async addNote(
    id: string,
    note: string,
    userId: string
  ): Promise<Location | null> {
    // Pourrait ajouter la note et un historique
    return this.updateLocation(id, {
      notes: note,
      // Tu peux enrichir modificationHistory ici aussi si besoin
    });
  }

  // Ajoute d'autres méthodes métier selon tes besoins spécifiques
}

// Pour l’import direct avec instance singleton si besoin
export const locationService = new LocationService();
