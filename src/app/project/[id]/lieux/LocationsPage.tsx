"use client";

import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import AddLocationForm from "@/features/project/locations/AddLocationForm";
import { locationService } from "@/services/LocationService";
import { Location } from "@/types/entities/Location";
import { Project } from "@/types/entities/Project";
import { useCallback, useEffect, useState } from "react";

interface LocationsPageProps {
  project: Project;
}

export default function LocationsPage({ project }: LocationsPageProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadLocations = useCallback(async () => {
    if (!project?.id) return;
    setLoadingLocations(true);
    try {
      const locs = await locationService.getAllLocations(project.id);
      setLocations(locs);
    } catch (error) {
      console.error("Erreur lors du chargement des lieux:", error);
    } finally {
      setLoadingLocations(false);
    }
  }, [project?.id]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  if (loadingLocations) {
    return <div>Chargement des lieux...</div>;
  }

  if (!project) {
    return <div>Projet non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lieux du projet</h1>
        <Button onClick={() => setModalOpen(true)}>Ajouter un lieu</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <div key={location.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-lg mb-2">{location.label}</h3>
            <p className="text-gray-600 mb-4">{location.address}</p>
            {location.notes && (
              <p className="text-sm text-gray-500">{location.notes}</p>
            )}
            <div className="mt-4 text-sm text-gray-400">
              Créé le {location.createdAt?.toDate().toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ajouter un lieu"
      >
        <AddLocationForm
          projectId={project.id}
          onSuccess={() => {
            setModalOpen(false);
            loadLocations();
          }}
        />
      </Modal>
    </div>
  );
}
