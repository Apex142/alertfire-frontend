// app/project/[id]/ProjectLayoutShell.tsx
"use client";

import ProjectSidebar from "@/components/project/ProjectMenuSidebar";
import { Loading } from "@/components/ui/Loading";
import { useProjectContext } from "@/contexts/ProjectContext";
import { Timestamp } from "firebase/firestore";
import React from "react";

function formatDate(date?: Date | string | Timestamp): string | undefined {
  if (!date) return undefined;
  let dateObj: Date;
  if (date instanceof Timestamp) dateObj = date.toDate();
  else if (date instanceof Date) dateObj = date;
  else dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return undefined;
  return dateObj.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProjectLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { project, isLoading, error } = useProjectContext();

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loading message="Chargement du projet..." />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[300px] text-red-500">
        Erreur : {error.message}
      </div>
    );

  if (!project) return <div>Projet introuvable.</div>;

  return (
    <div className="flex min-h-full">
      <ProjectSidebar
        title={project.projectName}
        startDate={formatDate(project.startDate)}
        endDate={formatDate(project.endDate)}
      />
      <div className="flex-1 px-3 py-16 md:py-0">{children}</div>
    </div>
  );
}
