'use client';

import { useState } from 'react';
import { ProjectHeader } from './ProjectHeader';
import { DaySelector } from './DaySelector';
import { AppointmentBlock } from './AppointmentBlock';
import { TechnicalTeamCard } from './TechnicalTeamCard';
import { DailySchedule } from './DailySchedule';
import { LocationTechInfo } from './LocationTechInfo';
import { Project } from '@/stores/useProjectData';

export default function ProjectDashboardClient({ project }: { project: Project }) {
  // Log pour debug
  console.log('ProjectDashboardClient props:', project);
  // Mock data pour la démo
  const days = [0, 1, 2, 3, 4].map(i => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState(days[0]);

  const appointments = [
    {
      date: selectedDay,
      locationName: 'Studio Canal+ Paris',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9999999999995!2d2.292292315674!3d48.8588440792876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fddf1e1e1e1%3A0x1e1e1e1e1e1e1e1e!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1680000000000!5m2!1sfr!2sfr',
    },
  ];
  const team = [
    { id: '1', name: 'Alice Martin', role: 'Chef Opérateur', status: 'accepté' as const },
    { id: '2', name: 'Bob Dupont', role: 'Ingé Son', status: 'en attente' as const },
  ];
  const events = [
    { id: '1', time: '07:00', label: 'TOURNAGE plateau', type: 'Tournage' },
    { id: '2', time: '12:00', label: 'Pause déjeuner', type: 'Repérage' },
    { id: '3', time: '14:00', label: 'Montage', type: 'Montage' },
  ];
  const techInfo = 'Prise électrique 32A, accès fibre, loge disponible.';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProjectHeader project={project} onEdit={() => alert('Modifier projet')} onFeuilleDeService={() => alert('Feuille de service')} />
      <DaySelector days={days} selected={selectedDay} onDateChange={setSelectedDay} />
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <AppointmentBlock {...appointments[0]} />
          <TechnicalTeamCard members={team} />
        </div>
        <div className="space-y-6">
          <DailySchedule events={events} />
          <LocationTechInfo info={techInfo} />
        </div>
      </div>
    </div>
  );
} 