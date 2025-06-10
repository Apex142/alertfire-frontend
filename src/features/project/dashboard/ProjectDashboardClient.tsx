"use client";

import { useProject } from "@/hooks/useProject";
import { Project } from "@/types/entities/Project";
import { useState } from "react";
import { AppointmentBlock } from "./AppointmentBlock";
import { DailySchedule } from "./DailySchedule";
import { DaySelector } from "./DaySelector";
import { LocationTechInfo } from "./LocationTechInfo";
import { ProjectHeader } from "./ProjectHeader";
import { TechnicalTeamCard } from "./TechnicalTeamCard";

export default function ProjectDashboardClient({
  project: initialProject,
}: {
  project: Project;
}) {
  // Si initialProject.id est déjà passé côté serveur/static, c'est idéal.
  const { project, technicians, loading, error, notFound } = useProject(
    initialProject.id
  );

  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const days = [0, 1, 2, 3, 4].map((i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const appointments = [
    {
      date: selectedDay,
      locationName: "Studio Canal+ Paris",
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9999999999995!2d2.292292315674!3d48.8588440792876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fddf1e1e1e1%3A0x1e1e1e1e1e1e1e1e!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1680000000000!5m2!1sfr!2sfr",
    },
  ];

  const events = [
    { id: "1", time: "07:00", label: "TOURNAGE plateau", type: "Tournage" },
    { id: "2", time: "12:00", label: "Pause déjeuner", type: "Repérage" },
    { id: "3", time: "14:00", label: "Montage", type: "Montage" },
  ];

  const techInfo = "Prise électrique 32A, accès fibre, loge disponible.";

  if (loading) return <div>Chargement…</div>;
  if (error) return <div className="text-red-500">Erreur : {error}</div>;
  if (notFound || !project) return <div>Projet introuvable.</div>;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
      <ProjectHeader
        project={project}
        onEdit={() => alert("Modifier project")}
        onFeuilleDeService={() => alert("Feuille de service")}
      />
      <div className="w-full overflow-hidden">
        <DaySelector
          days={days}
          selected={selectedDay}
          onDateChange={setSelectedDay}
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AppointmentBlock {...appointments[0]} />
          <TechnicalTeamCard members={technicians} />
        </div>
        <div className="space-y-6">
          <DailySchedule events={events} />
          <LocationTechInfo info={techInfo} />
        </div>
      </div>
    </div>
  );
}
