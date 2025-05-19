'use client';

import { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Layout } from '@/components/LayoutLogged';
import { Loading } from '@/components/ui/Loading';
import { formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import CreateProjectFlow from '@/features/projects/create/CreateProjectFlow';
import CustomProjectScheduler from '@/components/dashboard/CustomProjectScheduler';
import { Timestamp } from 'firebase/firestore';
import { Project } from '@/types/project';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

type ProjectStatus = 'confirmé' | 'à confirmer' | 'annulé';

interface CalendarOption {
  id: string;
  label: string;
  color: string;
  checked: boolean;
}

export default function DashboardPage() {
  const { loading, error, userData, projects } = useUserData();
  const [openCreate, setOpenCreate] = useState(false);
  const [showCalendars, setShowCalendars] = useState(true);
  const [calendars, setCalendars] = useState<CalendarOption[]>([
    { id: 'personal', label: 'Lucas G', color: 'bg-blue-500', checked: true },
    { id: 'multiviews', label: 'Multiviews', color: 'bg-purple-500', checked: true },
    { id: 'multiviews_sec', label: 'Multiviews_Secondaire', color: 'bg-yellow-500', checked: true },
  ]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading message="Chargement de votre tableau de bord..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400">
            Une erreur est survenue
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message}
          </p>
        </div>
      </Layout>
    );
  }

  const handleAddEvent = () => {
    setOpenCreate(true);
  };

  const handleProjectClick = (projectId: string) => {
    // TODO: Implémenter la navigation vers le projet
    console.log('Projet cliqué:', projectId);
  };

  const toggleCalendar = (id: string) => {
    setCalendars(calendars.map(cal =>
      cal.id === id ? { ...cal, checked: !cal.checked } : cal
    ));
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-theme(spacing.16)-1px)]">
        {/* Colonne latérale des agendas */}
        <div className="w-64 border-r border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">Mes agendas</h2>
            <button
              onClick={() => setShowCalendars(!showCalendars)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showCalendars ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showCalendars && (
            <div className="space-y-2">
              {calendars.map(calendar => (
                <label
                  key={calendar.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer group"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={calendar.checked}
                      onChange={() => toggleCalendar(calendar.id)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded ${calendar.color} flex items-center justify-center`}>
                      {calendar.checked && <Check size={12} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">{calendar.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-4">
          <div className="grid gap-6 w-full">
            <CustomProjectScheduler
              onProjectClick={handleProjectClick}
            />
          </div>
        </div>
      </div>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Créer un projet">
        <CreateProjectFlow />
      </Modal>
    </Layout>
  );
} 