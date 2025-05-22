import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useCompany } from "@/hooks/useCompany";
import { useUserData } from "@/hooks/useUserData";
import { useState } from "react";

interface EmptyStateProps {
  onAddEvent: () => void;
  onDuplicatePlanning: (projectId: string) => void;
}

export default function EmptyState({
  onAddEvent,
  onDuplicatePlanning,
}: EmptyStateProps) {
  const { userData } = useUserData();
  const companyId = userData?.companySelected;

  // Maintenant, tu as tout d'un coup :
  const { projects, loading, error } = useCompany(companyId);

  const [selectedProject, setSelectedProject] = useState<string>("");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun événement planifié
          </h3>
          <p className="text-gray-500 mb-6">
            Commencez par créer un événement ou dupliquez le planning d'un autre
            project.
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
                disabled={loading}
              >
                <option value="">Sélectionner un project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
              <Button
                variant="outline"
                onClick={() =>
                  selectedProject && onDuplicatePlanning(selectedProject)
                }
                disabled={!selectedProject}
              >
                Dupliquer le planning
              </Button>
            </div>
            {error && (
              <div className="text-sm text-red-500 mt-2">Erreur : {error}</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
