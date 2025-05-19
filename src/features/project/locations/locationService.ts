import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp,
  FirestoreError
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Location, ProjectLocation, EditPolicy, LocationModification } from '@/types/location';

// Codes d'erreur spécifiques
export enum LocationErrorCode {
  VALIDATION_ERROR = 'LOCATION_VALIDATION_ERROR',
  NOT_FOUND = 'LOCATION_NOT_FOUND',
  PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  SERVER_ERROR = 'LOCATION_SERVER_ERROR',
  NETWORK_ERROR = 'LOCATION_NETWORK_ERROR',
  INVALID_DATA = 'LOCATION_INVALID_DATA'
}

interface CreateLocationDTO {
  label: string;
  address: string;
  notes?: string;
  isPublic?: boolean;
  companyId?: string;
  createdBy: string;
  editPolicy: EditPolicy;
}

interface CreateProjectLocationDTO {
  label: string;
  address: string;
  notes?: string;
  locationId?: string;
}

class LocationServiceError extends Error {
  constructor(
    message: string,
    public code: LocationErrorCode | string = LocationErrorCode.SERVER_ERROR,
    public details?: any
  ) {
    super(message);
    this.name = 'LocationServiceError';
  }
}

const handleFirestoreError = (error: FirestoreError): LocationServiceError => {
  switch (error.code) {
    case 'permission-denied':
      return new LocationServiceError(
        'Vous n\'avez pas les permissions nécessaires pour effectuer cette action',
        LocationErrorCode.PERMISSION_DENIED,
        error
      );
    case 'not-found':
      return new LocationServiceError(
        'La ressource demandée n\'existe pas',
        LocationErrorCode.NOT_FOUND,
        error
      );
    case 'unavailable':
      return new LocationServiceError(
        'Le service est temporairement indisponible',
        LocationErrorCode.NETWORK_ERROR,
        error
      );
    case 'invalid-argument':
      return new LocationServiceError(
        'Les données fournies sont invalides',
        LocationErrorCode.INVALID_DATA,
        error
      );
    default:
      return new LocationServiceError(
        'Une erreur serveur est survenue',
        LocationErrorCode.SERVER_ERROR,
        error
      );
  }
};

// Fonction utilitaire pour convertir les timestamps Firestore
const convertFirestoreTimestamps = (data: any): any => {
  if (!data) return data;

  const result = { ...data };
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    } else if (value && typeof value === 'object') {
      result[key] = convertFirestoreTimestamps(value);
    }
  }
  return result;
};

export const locationService = {
  // Validation des données
  validateLocationData(data: CreateLocationDTO): void {
    try {
      if (!data.label?.trim()) {
        throw new LocationServiceError(
          'Le nom du lieu est requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }
      if (!data.address?.trim()) {
        throw new LocationServiceError(
          'L\'adresse du lieu est requise',
          LocationErrorCode.VALIDATION_ERROR
        );
      }
      if (!data.createdBy) {
        throw new LocationServiceError(
          'L\'identifiant de l\'utilisateur est requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }
      if (!['creativecommon', 'company', 'private'].includes(data.editPolicy)) {
        throw new LocationServiceError(
          'La politique d\'édition est invalide',
          LocationErrorCode.VALIDATION_ERROR
        );
      }
    } catch (error) {
      if (error instanceof LocationServiceError) {
        throw error;
      }
      throw new LocationServiceError(
        'Erreur de validation des données',
        LocationErrorCode.VALIDATION_ERROR,
        error
      );
    }
  },

  validateProjectLocationData(data: CreateProjectLocationDTO): void {
    try {
      if (!data.label?.trim()) {
        throw new LocationServiceError(
          'Le nom du lieu est requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }
      if (!data.address?.trim()) {
        throw new LocationServiceError(
          'L\'adresse du lieu est requise',
          LocationErrorCode.VALIDATION_ERROR
        );
      }
    } catch (error) {
      if (error instanceof LocationServiceError) {
        throw error;
      }
      throw new LocationServiceError(
        'Erreur de validation des données du projet',
        LocationErrorCode.VALIDATION_ERROR,
        error
      );
    }
  },

  // Créer un nouveau lieu global
  async createLocation(data: CreateLocationDTO): Promise<string> {
    try {
      console.log('Début de la création du lieu:', data);
      this.validateLocationData(data);
      console.log('Validation des données réussie');

      // Extraire les propriétés requises
      const { label, address, createdBy, editPolicy } = data;

      // Nettoyer les propriétés optionnelles en utilisant undefined au lieu de null
      const optionalData = {
        notes: data.notes || undefined,
        companyId: data.companyId || undefined,
        isPublic: data.isPublic ?? false
      };

      const locationData: Omit<Location, 'id'> = {
        label,
        address,
        createdBy,
        editPolicy,
        ...optionalData,
        isLegit: false,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        version: 1,
        modificationHistory: [],
        pendingModifications: []
      };
      console.log('Données du lieu préparées:', locationData);

      // Filtrer les valeurs undefined avant d'envoyer à Firestore
      const firestoreData = Object.fromEntries(
        Object.entries(locationData).filter(([_, value]) => value !== undefined)
      );

      const docRef = await addDoc(collection(db, 'locations'), firestoreData);
      console.log('Lieu créé avec succès, ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur détaillée lors de la création du lieu:', error);
      if (error instanceof LocationServiceError) {
        throw error;
      }
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur inattendue est survenue lors de la création du lieu',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Créer un lieu dans un projet
  async createProjectLocation(projectId: string, data: CreateProjectLocationDTO): Promise<string> {
    try {
      console.log('Début de la création du lieu dans le projet:', { projectId, data });
      if (!projectId) {
        throw new LocationServiceError(
          'L\'identifiant du projet est requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }

      this.validateProjectLocationData(data);
      console.log('Validation des données du projet réussie');

      const locationData: Omit<ProjectLocation, 'id'> = {
        ...data,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };
      console.log('Données du lieu de projet préparées:', locationData);

      // Filtrer les valeurs undefined avant d'envoyer à Firestore
      const firestoreData = Object.fromEntries(
        Object.entries(locationData).filter(([_, value]) => value !== undefined)
      );
      console.log('Données filtrées pour Firestore:', firestoreData);

      const docRef = await addDoc(collection(db, `projects/${projectId}/locations`), firestoreData);
      console.log('Lieu créé dans le projet avec succès, ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur détaillée lors de la création du lieu dans le projet:', error);
      if (error instanceof LocationServiceError) {
        throw error;
      }
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur inattendue est survenue lors de la création du lieu dans le projet',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Récupérer un lieu global par son ID
  async getLocationById(locationId: string): Promise<Location | null> {
    try {
      if (!locationId) {
        throw new LocationServiceError(
          'L\'identifiant du lieu est requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }

      const docRef = doc(db, 'locations', locationId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return convertFirestoreTimestamps({
        id: docSnap.id,
        ...docSnap.data()
      }) as Location;
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur est survenue lors de la récupération du lieu',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Récupérer un lieu de projet par son ID
  async getProjectLocationById(projectId: string, locationId: string): Promise<ProjectLocation | null> {
    try {
      if (!projectId || !locationId) {
        throw new LocationServiceError(
          'Les identifiants du projet et du lieu sont requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }

      const docRef = doc(db, `projects/${projectId}/locations`, locationId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return convertFirestoreTimestamps({
        id: docSnap.id,
        ...docSnap.data()
      }) as ProjectLocation;
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur est survenue lors de la récupération du lieu du projet',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Récupérer tous les lieux d'un projet
  async getProjectLocations(projectId: string): Promise<ProjectLocation[]> {
    try {
      if (!projectId) {
        throw new LocationServiceError(
          'L\'identifiant du projet est requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }

      const locationsRef = collection(db, `projects/${projectId}/locations`);
      const querySnapshot = await getDocs(locationsRef);

      return querySnapshot.docs.map(doc => convertFirestoreTimestamps({
        id: doc.id,
        ...doc.data()
      })) as ProjectLocation[];
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur est survenue lors de la récupération des lieux du projet',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Récupérer les lieux publics
  async getPublicLocations(): Promise<Location[]> {
    try {
      const q = query(
        collection(db, 'locations'),
        where('isPublic', '==', true),
        where('isLegit', '==', true)
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => convertFirestoreTimestamps({
        id: doc.id,
        ...doc.data()
      })) as Location[];
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur est survenue lors de la récupération des lieux publics',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Récupérer les lieux d'une entreprise
  async getCompanyLocations(companyId: string): Promise<Location[]> {
    try {
      console.log('Début getCompanyLocations avec companyId:', companyId);

      if (!companyId) {
        throw new LocationServiceError(
          'L\'identifiant de l\'entreprise est requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }

      const q = query(
        collection(db, 'locations'),
        where('companyId', '==', companyId)
      );
      console.log('Query Firestore construite:', q);

      const querySnapshot = await getDocs(q);
      console.log('Résultats de la requête:', {
        empty: querySnapshot.empty,
        size: querySnapshot.size,
        docs: querySnapshot.docs.map(doc => convertFirestoreTimestamps({ id: doc.id, ...doc.data() }))
      });

      return querySnapshot.docs.map(doc => convertFirestoreTimestamps({
        id: doc.id,
        ...doc.data()
      })) as Location[];
    } catch (error) {
      console.error('Erreur détaillée dans getCompanyLocations:', error);
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur est survenue lors de la récupération des lieux de l\'entreprise',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Mettre à jour un lieu global
  async updateLocation(locationId: string, data: Partial<Location>): Promise<void> {
    try {
      if (!locationId) {
        throw new LocationServiceError(
          'L\'identifiant du lieu est requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }

      const docRef = doc(db, 'locations', locationId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
        version: data.version ? data.version + 1 : 1
      });
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur est survenue lors de la mise à jour du lieu',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Mettre à jour un lieu de projet
  async updateProjectLocation(
    projectId: string,
    locationId: string,
    data: Partial<ProjectLocation>
  ): Promise<void> {
    try {
      if (!projectId || !locationId) {
        throw new LocationServiceError(
          'Les identifiants du projet et du lieu sont requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }

      const docRef = doc(db, `projects/${projectId}/locations`, locationId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur est survenue lors de la mise à jour du lieu du projet',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Supprimer un lieu global
  async deleteLocation(locationId: string): Promise<void> {
    try {
      if (!locationId) {
        throw new LocationServiceError(
          'L\'identifiant du lieu est requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }

      await deleteDoc(doc(db, 'locations', locationId));
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur est survenue lors de la suppression du lieu',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  },

  // Supprimer un lieu de projet
  async deleteProjectLocation(projectId: string, locationId: string): Promise<void> {
    try {
      if (!projectId || !locationId) {
        throw new LocationServiceError(
          'Les identifiants du projet et du lieu sont requis',
          LocationErrorCode.VALIDATION_ERROR
        );
      }

      await deleteDoc(doc(db, `projects/${projectId}/locations`, locationId));
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw handleFirestoreError(error);
      }
      throw new LocationServiceError(
        'Une erreur est survenue lors de la suppression du lieu du projet',
        LocationErrorCode.SERVER_ERROR,
        error
      );
    }
  }
}; 