import { useState, useEffect } from 'react';
import { locationService } from '@/features/project/locations/locationService';
import { useAuth } from './useAuth';
import { useCompany } from './useCompany';
import { notify } from '@/lib/notify';
import { LocationErrorCode } from '@/features/project/locations/locationService';
import { DisplayLocation, adaptLocationToDisplay } from '@/features/locations/adapters';

interface UseLocationsReturn {
  myLocations: DisplayLocation[];
  publicLocations: DisplayLocation[];
  favoriteLocations: DisplayLocation[];
  isLoading: boolean;
  error: string | null;
  refreshLocations: () => Promise<void>;
}

export function useLocations(): UseLocationsReturn {
  const [myLocations, setMyLocations] = useState<DisplayLocation[]>([]);
  const [publicLocations, setPublicLocations] = useState<DisplayLocation[]>([]);
  const [favoriteLocations, setFavoriteLocations] = useState<DisplayLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { currentCompany } = useCompany();

  const loadLocations = async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Début du chargement des lieux, currentCompany:', currentCompany);

      const [publicLocs, companyLocs] = await Promise.all([
        locationService.getPublicLocations(),
        currentCompany ? locationService.getCompanyLocations(currentCompany.id) : Promise.resolve([])
      ]);

      console.log('Lieux chargés:', {
        publicLocs,
        companyLocs,
        currentCompanyId: currentCompany?.id
      });

      // Convertir les lieux en format d'affichage
      const publicDisplayLocs = publicLocs.map(adaptLocationToDisplay);
      const companyDisplayLocs = companyLocs.map(adaptLocationToDisplay);

      console.log('Lieux convertis:', {
        publicDisplayLocs,
        companyDisplayLocs
      });

      // Filtrer les lieux de l'utilisateur
      const userLocs = companyDisplayLocs.filter(
        loc => loc.createdBy === user.uid || loc.companyId === currentCompany?.id
      );

      console.log('Lieux filtrés:', {
        userLocs,
        userId: user.uid,
        companyId: currentCompany?.id
      });

      // Filtrer les favoris
      const favLocs = publicDisplayLocs.filter(
        loc => user.favoriteLocationIds?.includes(loc.id)
      );

      setMyLocations(userLocs);
      setPublicLocations(publicDisplayLocs);
      setFavoriteLocations(favLocs);
    } catch (error: any) {
      console.error('Erreur détaillée lors du chargement des lieux:', error);

      if (error.code === LocationErrorCode.PERMISSION_DENIED) {
        setError('Vous n\'avez pas les permissions nécessaires pour accéder aux lieux');
      } else if (error.code === LocationErrorCode.NETWORK_ERROR) {
        setError('Erreur de connexion. Veuillez vérifier votre connexion internet');
      } else {
        setError('Une erreur est survenue lors du chargement des lieux');
      }

      notify.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, [user, currentCompany]);

  return {
    myLocations,
    publicLocations,
    favoriteLocations,
    isLoading,
    error,
    refreshLocations: loadLocations
  };
} 