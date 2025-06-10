import { useAuth } from "@/contexts/AuthContext";
import {
  DisplayLocation,
  adaptLocationToDisplay,
} from "@/features/locations/adapters";
import { notify } from "@/lib/notify";
import { locationService } from "@/services/LocationService";
import { LocationErrorCode } from "@/types/enums/LocationErrorCode";
import { useEffect, useState } from "react";
// import { useCompany } from "@/contexts/CompanyContext"; // À activer si tu as ce hook

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
  const [favoriteLocations, setFavoriteLocations] = useState<DisplayLocation[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { appUser } = useAuth();
  // const { currentCompany } = useCompany();
  const currentCompany: { id: string } | undefined = undefined; // À remplacer si tu utilises un vrai hook

  const loadLocations = async () => {
    if (!appUser) {
      setError("Utilisateur non connecté");
      setIsLoading(false);
      setMyLocations([]);
      setPublicLocations([]);
      setFavoriteLocations([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [publicLocs, companyLocs] = await Promise.all([
        locationService.getPublicLocations(),
        currentCompany
          ? locationService.getCompanyLocations(currentCompany.id)
          : Promise.resolve([]),
      ]);

      // Convertir les lieux en format d'affichage
      const publicDisplayLocs = publicLocs.map(adaptLocationToDisplay);
      const companyDisplayLocs = companyLocs.map(adaptLocationToDisplay);

      // Filtrer les lieux de l'utilisateur
      const userLocs = companyDisplayLocs.filter(
        (loc) =>
          loc.createdBy === appUser.uid ||
          (currentCompany && loc.companyId === currentCompany.id)
      );

      // Filtrer les favoris parmi les lieux publics
      const favLocs = publicDisplayLocs.filter((loc) =>
        appUser.favoriteLocationIds?.includes(loc.id)
      );

      setMyLocations(userLocs);
      setPublicLocations(publicDisplayLocs);
      setFavoriteLocations(favLocs);
    } catch (error: any) {
      console.error("Erreur lors du chargement des lieux:", error);

      if (error.code === LocationErrorCode.PERMISSION_DENIED) {
        setError(
          "Vous n'avez pas les permissions nécessaires pour accéder aux lieux"
        );
      } else if (error.code === LocationErrorCode.NETWORK_ERROR) {
        setError(
          "Erreur de connexion. Veuillez vérifier votre connexion internet"
        );
      } else {
        setError("Une erreur est survenue lors du chargement des lieux");
      }

      notify.error(error.message || String(error));
      setMyLocations([]);
      setPublicLocations([]);
      setFavoriteLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser, currentCompany]); // Corrigé : dépendance sur appUser, pas sur user

  return {
    myLocations,
    publicLocations,
    favoriteLocations,
    isLoading,
    error,
    refreshLocations: loadLocations,
  };
}
