// src/hooks/useProjectWizard.ts
"use client";

import { ProjectService } from "@/services/ProjectService";
import { Project } from "@/types/entities/Project";
import { ProjectStatus } from "@/types/enums/ProjectStatus";
import { Timestamp } from "firebase/firestore";
import { useState } from "react";

export interface WizardState {
  /* étape 1 */
  name: string;
  description: string;

  /* étape 2 */
  isMaster: boolean;
  latitude?: number;
  longitude?: number;
  altitude?: number;

  /* étape 3 */
  technicianIds: string[];
  firefighterIds: string[];

  /* étape 4 */
  manualId: string /** UUID saisi / scanné */;
}

export function useProjectWizard() {
  /* ---------- état local ---------- */
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ---------- données du wizard ---------- */
  const [data, setData] = useState<WizardState>({
    name: "",
    description: "",
    isMaster: true,
    technicianIds: [],
    firefighterIds: [],
    manualId: "",
  });

  /** Patch partiel */
  const update = (patch: Partial<WizardState>) =>
    setData((prev) => ({ ...prev, ...patch }));

  /* ---------- navigation ---------- */
  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  /* ---------- SUBMIT ---------- */
  const submit = async () => {
    setLoading(true);

    /* 1. Construction brute */
    const now = Timestamp.now();

    console.log("Data à soumettre :", data);
    console.log(data);

    const baseProject: Project = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
      altitude: data.altitude,
      status: ProjectStatus.OK,
      createdAt: now,
      updatedAt: now,
      isMaster: data.isMaster,
      ownerCompanyId: "default",
      technicianIds: data.technicianIds,
      firefighterIds: data.firefighterIds,
      manualId: data.manualId.trim() ?? 0,
      activations: [],
      activationCount: 0,
    };

    /* 2. Nettoyage : on retire *toutes* les clés indéfinies */
    const project: Project = Object.fromEntries(
      Object.entries(baseProject).filter(([, v]) => v !== undefined)
    ) as Project;

    /* 3. Persistance */
    await ProjectService.create(project);

    /* 4. Fin */
    setLoading(false);
    setSubmitted(true);
    next(); // passe à l’étape « succès »
  };

  return {
    /* data */
    step,
    data,
    loading,
    submitted,

    /* helpers */
    update,
    next,
    prev,
    submit,
  };
}
