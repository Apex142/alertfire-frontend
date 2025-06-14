import { useActiveProjectStore } from "@/app/project/[id]/useActiveProjectStore";
import { Button } from "@/components/ui/Button";
import Stepper from "@/components/ui/Stepper";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import { ProjectMemberStatus } from "@/types/enums/ProjectMemberStatus";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import StepRoleSelect from "./Step1RoleSelect";
import StepDetails from "./Step2Details";
import StepEvents from "./Step3Events";
import StepTechnician from "./Step4Technician";
import StepSummary from "./Step5Summary";

interface AddRoleFlowProps {
  onSuccess: () => void;
  projectId: string;
}

export default function AddRoleFlow({
  onSuccess,
  projectId,
}: AddRoleFlowProps) {
  const { project, setActiveProject } = useActiveProjectStore();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<any>(null);
  const [linkType, setLinkType] = useState<"project" | "events">("project");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [technician, setTechnician] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedAction, setSelectedAction] = useState<
    "invite" | "force" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isStepValid(stepId: string): boolean {
    if (stepId === "role") return !!role;
    if (stepId === "details") return !!role;
    if (stepId === "events")
      return linkType === "project" || selectedEvents.length > 0;
    if (stepId === "technician") return !!technician && !!selectedAction;
    return true;
  }

  useEffect(() => {
    if (projectId) setActiveProject(projectId);
  }, [projectId, setActiveProject]);

  const handleNext = () => {
    if (step < visibleSteps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const { appUser } = useAuth();
  const currentUserId = appUser?.uid ?? "system";

  const steps = [
    {
      id: "role",
      label: "Poste",
      content: (
        <StepRoleSelect value={role} onChange={setRole} onNext={handleNext} />
      ),
    },
    {
      id: "details",
      label: "Détails",
      content: (
        <StepDetails
          role={role}
          linkType={linkType}
          setLinkType={setLinkType}
          onNext={handleNext}
        />
      ),
    },
    {
      id: "events",
      label: "Événements",
      content: (
        <StepEvents
          selectedEvents={selectedEvents}
          setSelectedEvents={setSelectedEvents}
          linkType={linkType}
        />
      ),
    },
    {
      id: "technician",
      label: "Technicien",
      content: (
        <StepTechnician
          selectedTechnician={technician}
          setSelectedTechnician={setTechnician}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
        />
      ),
    },
    {
      id: "summary",
      label: "Résumé",
      content: (
        <StepSummary
          roleTemplate={role}
          linkType={linkType}
          selectedEvents={selectedEvents}
          technician={technician}
          inviteEmail={inviteEmail}
          selectedAction={selectedAction}
        />
      ),
    },
  ];

  const visibleSteps =
    linkType === "project" ? steps.filter((s) => s.id !== "events") : steps;
  const isLastStep = step === visibleSteps.length - 1;
  const isFirstStep = step === 0;

  async function handleSubmit() {
    if (!role) {
      setError("Veuillez sélectionner un poste");
      return;
    }
    if (!technician) {
      setError("Veuillez sélectionner un technicien");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Récupérer le token Firebase ID
      const idToken = (await FirebaseAuthentication.getIdToken()).token;
      if (!idToken) throw new Error("Utilisateur non authentifié");

      // Appel API sécurisée
      const response = await fetch("/api/project/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          projectId,
          role,
          linkType,
          selectedEvents,
          status:
            selectedAction === "force"
              ? ProjectMemberStatus.APPROVED
              : ProjectMemberStatus.PENDING,
          technicianUid: technician.uid,
          invitedByUid: currentUserId,
          projectName: project?.projectName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur inconnue lors de l'invitation");
      }

      notify.success("Affectation réussie !");
      onSuccess();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Une erreur est survenue";
      setError("Erreur lors de l'affectation : " + errorMessage);
      notify.error("Erreur lors de l'affectation : " + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!project) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white/95 shadow-xl rounded-xl px-2 sm:px-4 py-6">
      <div className="px-0 sm:px-0">
        <Stepper steps={visibleSteps} currentStep={step} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={visibleSteps[step].id}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="mt-4"
        >
          {visibleSteps[step].content}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center mt-4 gap-2 px-1">
        {!isFirstStep ? (
          <Button
            variant="ghost"
            className="rounded-lg px-4 py-2 font-medium text-gray-500 hover:text-primary/90 transition"
            onClick={handleBack}
            disabled={loading}
          >
            Retour
          </Button>
        ) : (
          <span />
        )}
        {isLastStep ? (
          <Button
            variant="primary"
            className="rounded-lg px-6 py-2 font-bold shadow-md min-w-[112px] text-base flex items-center justify-center"
            onClick={handleSubmit}
            disabled={loading || !role || !technician}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-70"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Chargement...
              </span>
            ) : (
              <div>
                <span>Valider</span>
              </div>
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="rounded-lg px-6 py-2 font-bold shadow min-w-[112px] text-base flex items-center justify-center"
            onClick={handleNext}
            disabled={!isStepValid(visibleSteps[step].id)}
          >
            Suivant
          </Button>
        )}
      </div>

      {error && (
        <motion.div
          className="text-red-500 text-sm mt-4 px-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
