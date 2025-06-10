// src/features/projects/create/CreateProjectFlow.tsx
"use client";

import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import {
  projectService,
  CreateProjectData as ServiceCreateData,
} from "@/services/ProjectService";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Step1InformationsGenerales from "./Step1InformationsGenerales";
import Step2CompanyAndPrivacy from "./Step2CompanyAndPrivacy";
import { useCreateProjectStore } from "./useCreateProjectStore";

interface CreateProjectFlowProps {
  initialDate?: Date | null;
  onClose?: () => void; // Appelé pour fermer le modal parent
  onProjectCreated?: (projectId: string) => void;
}

export default function CreateProjectFlow({
  initialDate,
  onClose,
  onProjectCreated,
}: CreateProjectFlowProps) {
  const {
    data: projectDataFromStore,
    resetData: resetProjectStore, // Utiliser pour une réinitialisation complète
    currentStep,
    setCurrentStep,
  } = useCreateProjectStore();
  const { appUser } = useAuth();
  const router = useRouter();
  const [isGloballySubmitting, setIsGloballySubmitting] = useState(false);

  // S'assurer que l'on commence toujours à l'étape 1 quand le flux est monté/visible
  useEffect(() => {
    console.log(
      "CreateProjectFlow: Mounted or initialDate changed. Setting step to 1."
    );
    setCurrentStep(1);
    // Ne pas appeler resetProjectStore() ici pour permettre la reprise si des données ont été partiellement saisies
    // et que le modal a été fermé/rouvert sans soumission. Le reset se fait après soumission ou annulation explicite.
  }, [setCurrentStep]); // Se déclenche au montage

  const handleGoToStep1 = () => {
    // Pas besoin de réinitialiser companyId/privacy ici, car Step1 ne les utilise pas
    // et Step2 les rechargera depuis le store (qui a potentiellement encore les anciennes valeurs)
    // ou depuis ses propres defaultValues. La navigation vers Step1 suffit.
    setCurrentStep(1);
  };

  const handleGoToStep2 = () => {
    setCurrentStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!appUser) {
      notify.error("Utilisateur non authentifié. Veuillez vous reconnecter.");
      return;
    }
    if (!projectDataFromStore.companyId) {
      notify.error("La compagnie est requise pour créer un projet.");
      setCurrentStep(2); // S'assurer que l'utilisateur est sur la bonne étape pour corriger
      return;
    }
    if (
      !projectDataFromStore.projectName ||
      !projectDataFromStore.startDate ||
      !projectDataFromStore.endDate ||
      !projectDataFromStore.color ||
      !projectDataFromStore.status ||
      !projectDataFromStore.privacy
    ) {
      notify.error(
        "Des informations requises sont manquantes. Veuillez compléter toutes les étapes."
      );
      setCurrentStep(1); // Ramener à l'étape 1 si des infos de base manquent
      return;
    }

    setIsGloballySubmitting(true);
    try {
      const dataForService: ServiceCreateData = {
        projectName: projectDataFromStore.projectName,
        acronym: projectDataFromStore.acronym || null,
        description: projectDataFromStore.description || null,
        color: projectDataFromStore.color,
        companyId: projectDataFromStore.companyId,
        startDate: projectDataFromStore.startDate, // Doit être un objet Date
        endDate: projectDataFromStore.endDate, // Doit être un objet Date
        privacy: projectDataFromStore.privacy,
        status: projectDataFromStore.status,
        tags: projectDataFromStore.tags
          ? projectDataFromStore.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const createdProject = await projectService.createProject(
        dataForService,
        appUser.uid
      );

      notify.success(
        `Projet "${createdProject.projectName}" créé avec succès !`
      );
      resetProjectStore(); // Réinitialiser le store et currentStep à 1 APRÈS succès

      if (onProjectCreated) {
        onProjectCreated(createdProject.id);
      } else {
        router.push(`/project/${createdProject.id}/overview`);
      }
      onClose?.(); // Fermer le modal parent
    } catch (e) {
      console.error("CreateProjectFlow - Erreur de soumission finale:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      notify.error(`Erreur: ${errorMessage}`);
    } finally {
      setIsGloballySubmitting(false);
    }
  };

  // Si on ferme le modal (via le bouton annuler des étapes ou la croix du modal),
  // on réinitialise le store pour la prochaine ouverture.
  const handleCloseAndReset = () => {
    resetProjectStore(); // Remet currentStep à 1 et vide les données
    onClose?.();
  };

  if (isGloballySubmitting) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <Loading message="Création du projet en cours..." />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Veuillez patienter...
        </p>
      </div>
    );
  }

  if (!appUser && !isGloballySubmitting) {
    return (
      <div className="p-6 text-center min-h-[300px] flex flex-col items-center justify-center">
        <p className="text-red-500 dark:text-red-400 font-medium">
          Veuillez vous connecter pour créer un projet.
        </p>
      </div>
    );
  }

  return (
    // Donner une hauteur minimale au conteneur du flux si le contenu est petit (ex: état de chargement)
    <div className="p-1 sm:p-0 min-h-[400px]">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-6 md:mb-8 overflow-hidden">
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStep / 2) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* Le onClose des étapes est maintenant géré par le onClose global du modal,
          qui appellera handleCloseAndReset si nécessaire. */}
      <p>TTTTTTTTTT{currentStep}TTTTTTTTTTT</p>
      <AnimatePresence mode="wait" initial={false}>
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <Step1InformationsGenerales
              onNext={handleGoToStep2} // Utilise la nouvelle fonction
              initialDate={initialDate}
              // onCancel={handleCloseAndReset} // Le bouton Annuler de Step1 pourrait appeler ça
            />
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <Step2CompanyAndPrivacy
              onNext={handleFinalSubmit}
              onBack={handleGoToStep1} // Utilise la nouvelle fonction
              // onCancel={handleCloseAndReset} // Le bouton Annuler de Step2 pourrait appeler ça
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
