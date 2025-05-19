import { useState, useEffect } from "react";
import StepRoleSelect from "./Step1RoleSelect";
import StepDetails from "./Step2Details";
import StepEvents from "./Step3Events";
import StepTechnician from "./Step4Technician";
import StepSummary from "./Step5Summary";
import { Button } from "@/components/ui/Button";
import Stepper from "@/components/ui/Stepper";
import { notify } from '@/lib/notify';
import { useActiveProject } from '@/stores/useActiveProjectStore';
import { createPost, createMembership } from './roleService';

interface AddRoleFlowProps {
  onSuccess: () => void;
  projectId: string;
}

export default function AddRoleFlow({ onSuccess, projectId }: AddRoleFlowProps) {
  const { project, setActiveProject } = useActiveProject();

  // États pour chaque étape
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<any>(null);
  const [linkType, setLinkType] = useState<'project' | 'events'>('project');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [technician, setTechnician] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Charger les données du projet au montage du composant
  useEffect(() => {
    if (projectId) {
      setActiveProject(projectId);
    }
  }, [projectId, setActiveProject]);

  const handleNext = () => {
    if (step < visibleSteps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const steps = [
    {
      id: 'role',
      label: "Poste",
      content: (
        <StepRoleSelect
          value={role}
          onChange={setRole}
          onNext={handleNext}
        />
      )
    },
    {
      id: 'details',
      label: "Détails",
      content: (
        <StepDetails
          role={role}
          linkType={linkType}
          setLinkType={setLinkType}
          onNext={handleNext}
        />
      )
    },
    {
      id: 'events',
      label: "Événements",
      content: (
        <StepEvents
          selectedEvents={selectedEvents}
          setSelectedEvents={setSelectedEvents}
          linkType={linkType}
        />
      )
    },
    {
      id: 'technician',
      label: "Technicien",
      content: (
        <StepTechnician
          selectedTechnician={technician}
          setSelectedTechnician={setTechnician}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
        />
      )
    },
    {
      id: 'summary',
      label: "Résumé",
      content: (
        <StepSummary
          roleTemplate={role}
          linkType={linkType}
          selectedEvents={selectedEvents}
          technician={technician}
          inviteEmail={inviteEmail}
        />
      )
    }
  ];

  // Si le poste est lié à l'ensemble du projet, on saute le step events
  const visibleSteps = linkType === 'project'
    ? steps.filter(s => s.id !== 'events')
    : steps;

  const isLastStep = step === visibleSteps.length - 1;
  const isFirstStep = step === 0;

  async function handleSubmit() {
    if (!role) {
      setError('Veuillez sélectionner un poste');
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // 1. Création du post (toujours)
      const postId = await createPost({
        projectId,
        postData: {
          isGlobal: linkType === 'project',
          eventId: linkType === 'events' ? selectedEvents[0] : '',
          createdBy: technician?.uid || 'system',
          title: role?.label || '',
          icon: role?.icon || '',
          priority: role?.priority || 0,
          category: role?.category || '',
          memberIds: technician ? [technician.uid] : [],
          role_template_id: role?.id || '',
        }
      });

      // 2. Création du membership si technicien sélectionné
      if (technician) {
        await createMembership({
          userId: technician.uid,
          projectId,
          role,
          linkType,
          selectedEvents: linkType === 'events' ? selectedEvents : [],
          status: 'pending' // Statut par défaut pour les nouveaux membres
        });
      }

      setSuccess(true);
      notify.success('Affectation réussie !');
      onSuccess();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Une erreur est survenue';
      setError('Erreur lors de l\'affectation : ' + errorMessage);
      notify.error('Erreur lors de l\'affectation : ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!project) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Stepper
        steps={visibleSteps}
        currentStep={step}
        onStepChange={(index: number) => setStep(index)}
      />

      <div className="mt-6">
        {visibleSteps[step].content}
      </div>

      <div className="flex justify-between mt-6">
        {!isFirstStep && (
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={loading}
          >
            Retour
          </Button>
        )}

        {isLastStep ? (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !role}
          >
            {loading ? 'Chargement...' : 'Valider'}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!role}
          >
            Suivant
          </Button>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-4">
          {error}
        </div>
      )}
    </div>
  );
} 