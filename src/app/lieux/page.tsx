'use client';

import { Layout } from '@/components/LayoutLogged';
import LocationsHeader from '@/features/locations/LocationsHeader';
import LocationsSection from '@/features/locations/LocationsSection';
import { useLocations } from '@/hooks/useLocations';
import { Loading } from '@/components/ui/Loading';

// Mock user et company pour la démo
const user = { uid: 'demoUser', favoriteLocationIds: ['loc2'] };
const currentCompanyId = 'company1';

// Mock locations pour la démo
const locations = [
  { id: 'loc1', name: 'Studio Canal+', address: 'Paris', type: 'Studio', status: 'privé', createdBy: 'demoUser', companyId: 'company1', isPublic: false },
  { id: 'loc2', name: 'Parc Expo', address: 'Lyon', type: 'Salle', status: 'public', createdBy: 'other', companyId: null, isPublic: true },
  { id: 'loc3', name: 'Open Space', address: 'Marseille', type: 'Coworking', status: 'collaboratif', createdBy: 'other', companyId: null, isPublic: true },
];

const myLocations = locations.filter(l => l.createdBy === user.uid || l.companyId === currentCompanyId);
const publicLocations = locations.filter(l => l.isPublic);
const favoriteLocations = locations.filter(l => user.favoriteLocationIds?.includes(l.id));

export default function LieuxPage() {
  const {
    myLocations,
    publicLocations,
    favoriteLocations,
    isLoading,
    error,
    refreshLocations
  } = useLocations();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={refreshLocations}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <LocationsHeader onRefresh={refreshLocations} />
        <div className="mt-8 space-y-10">
          <LocationsSection
            title="Mes lieux"
            locations={myLocations}
            emptyMessage="Vous n'avez pas encore ajouté de lieu."
            type="my"
          />
          <LocationsSection
            title="Lieux publics"
            locations={publicLocations}
            emptyMessage="Aucun lieu public trouvé."
            type="public"
          />
          {favoriteLocations.length > 0 && (
            <LocationsSection
              title="Favoris"
              locations={favoriteLocations}
              emptyMessage="Aucun favori."
              type="favorite"
            />
          )}
        </div>
      </div>
    </Layout>
  );
} 