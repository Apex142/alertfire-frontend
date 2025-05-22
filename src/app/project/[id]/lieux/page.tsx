"use client";

import { useActiveProject } from "@/stores/useActiveProjectStore";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import AddLocationForm from "@/features/project/locations/AddLocationForm";

interface Location {
  id: string;
  label: string;
  address: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function LocationsPage() {
  const { project, isLoading } = useActiveProject();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!project) return;

    const loadLocations = async () => {
      try {
        setLoadingLocations(true);
        const locationsRef = collection(db, `projects/${project.id}/locations`);
        const querySnapshot = await getDocs(locationsRef);

        const locationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Location[];

        setLocations(locationsData);
      } catch (error) {
        console.error("Erreur lors du chargement des lieux:", error);
      } finally {
        setLoadingLocations(false);
      }
    };

    loadLocations();
  }, [project]);

  if (isLoading || loadingLocations) {
    return <div>Chargement...</div>;
  }

  if (!project) {
    return <div>project non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lieux du project</h1>
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
              Créé le {location.createdAt.toLocaleDateString()}
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
