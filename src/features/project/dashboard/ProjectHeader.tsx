import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Project } from '@/stores/useProjectData';

interface ProjectHeaderProps {
  project: Project;
  onEdit?: () => void;
  onFeuilleDeService?: () => void;
}

export const ProjectHeader = ({ project, onEdit, onFeuilleDeService }: ProjectHeaderProps) => (
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-4">
      <h1 className="text-2xl font-bold">
        {project.projectName} <span className="text-sm text-gray-500">{project.acronym}</span>
      </h1>
      <StatusBadge status={project.status === 'Confirmé' ? 'validé' : 'en attente'} />
    </div>
    <div className="flex gap-2">
      <Button variant="outline" onClick={onFeuilleDeService}>Feuille de service</Button>
      <Button variant="primary" onClick={onEdit}>Modifier</Button>
    </div>
  </div>
); 