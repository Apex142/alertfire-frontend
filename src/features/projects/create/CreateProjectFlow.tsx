"use client";

import {
  createMembership,
  createPost,
} from "@/features/project/roles/add/roleService";
import { useUserData } from "@/hooks/useUserData";
import { db } from "@/lib/firebase";
import { notify } from "@/lib/notify";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Step1InformationsGenerales from "./Step1InformationsGenerales";
import Step2CompanyAndPrivacy from "./Step2CompanyAndPrivacy";

interface Step1Data {
  [key: string]: any; // Remplace avec une interface propre si possible
}

interface Props {
  initialDate?: Date;
  onClose?: () => void;
  onProjectCreated?: (projectId: string) => void;
}

export default function CreateProjectFlow({
  initialDate,
  onClose,
  onProjectCreated,
}: Props) {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const { user } = useUserData();
  const router = useRouter();

  const handleCreateProject = async (projectData: Step1Data) => {
    if (!user) return;

    try {
      const projectRef = await addDoc(collection(db, "projects"), {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
      });
      const projectId = projectRef.id;

      await createPost({
        projectId,
        postData: {
          isGlobal: true,
          eventId: "",
          createdBy: user.uid,
          title: "Administrateur",
          icon: "admin-icon",
          priority: 0,
          category: "admin",
          memberIds: [user.uid],
          role_template_id: "admin",
        },
      });

      await createMembership({
        userId: user.uid,
        projectId,
        role: "admin",
        status: "approved",
        linkType: "project",
        selectedEvents: [],
      });

      notify.success("project créé avec succès !");

      if (onProjectCreated) onProjectCreated(projectId);
      else router.push(`/project/${projectId}/`);
    } catch (e) {
      notify.error(
        "Erreur lors de la création du project : " +
          (e instanceof Error ? e.message : "")
      );
    }
  };

  return (
    <>
      {step === 1 && (
        <Step1InformationsGenerales
          onNext={(data: Step1Data) => {
            setStep1Data(data);
            setStep(2);
          }}
          initialDate={initialDate}
        />
      )}
      {step === 2 && step1Data && (
        <Step2CompanyAndPrivacy
          onNext={async (data) => {
            const mergedData = { ...step1Data, ...data };
            await handleCreateProject(mergedData);
            onClose?.();
          }}
          onBack={() => setStep(1)}
        />
      )}
    </>
  );
}
