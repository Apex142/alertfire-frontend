import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Select } from '@/components/ui/Select';
import { useUserData } from '@/hooks/useUserData';

interface Project {
  id: string;
  name: string;
  companyId: string;
}

interface EmptyStateProps {
  onAddEvent: () => void;
  onDuplicatePlanning: (projectId: string) => void;
}

export default function EmptyState({ onAddEvent, onDuplicatePlanning }: EmptyStateProps) {
  const { userData } = useUserData();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = async () => {
    if (!userData?.companySelected) return;

    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'projects'),
        where('companyId', '==', userData.companySelected)
      );
      const snapshot = await getDocs(q);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        companyId: doc.data().companyId,
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les projets au montage du composant
  useEffect(() => {
    loadProjects();
  }, [userData?.companySelected]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun événement planifié
          </h3>
          <p className="text-gray-500 mb-6">
            Commencez par créer un événement ou dupliquez le planning d'un autre projet.
          </p>

          <div className="flex flex-col gap-6">
            <Button
              variant="primary"
              onClick={onAddEvent}
              className="w-full sm:w-auto"
            >
              + Créer un événement
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">ou</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                onFocus={loadProjects}
                disabled={isLoading}
              >
                <option value="">Sélectionner un projet</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
              <Button
                variant="outline"
                onClick={() => selectedProject && onDuplicatePlanning(selectedProject)}
                disabled={!selectedProject}
              >
                Dupliquer le planning
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 