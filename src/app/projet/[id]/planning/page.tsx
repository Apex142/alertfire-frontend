'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/project/planning/EmptyState';
import CreateEventForm from '@/features/project/planning/create/CreateEventForm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import EventDetailsModal from './EventDetailsModal';
import { useProjectContext } from '../providers';
import { Loading } from '@/components/ui/Loading';
import { useUserDataContext } from '@/app/providers';
import type { Event } from '@/types/event';

function formatHour(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':');
  return `${h}H${m}`;
}

interface Member {
  id: string;
  name: string;
  role: string;
  email?: string;
  photoUrl?: string;
}

export default function PlanningPage() {
  const { project, events, loadingEvents, refreshEvents } = useProjectContext();
  const { userData, projects } = useUserDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presetDate, setPresetDate] = useState<string | null>(null);
  const [presetLocation, setPresetLocation] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Organiser les données pour la vue en blocs
  const planningData = useMemo(() => {
    // Grouper les événements par date puis par lieu
    const eventsByDate: Record<string, Record<string, Event[]>> = {};
    events.forEach(event => {
      if (!eventsByDate[event.date]) eventsByDate[event.date] = {};
      if (!eventsByDate[event.date][event.locationLabel]) eventsByDate[event.date][event.locationLabel] = [];
      eventsByDate[event.date][event.locationLabel].push(event);
    });
    // Trier les dates
    const sortedDates = Object.keys(eventsByDate).sort();
    return { dates: sortedDates, eventsByDate };
  }, [events]);

  // Fonction pour ouvrir le modal avec préremplissage
  const handleAddEventWithPreset = (date: string, location: string) => {
    setPresetDate(date);
    setPresetLocation(location);
    setIsModalOpen(true);
  };

  // Fonction pour ouvrir le modal sans préremplissage
  const handleAddEvent = () => {
    setPresetDate(null);
    setPresetLocation(null);
    setIsModalOpen(true);
  };

  // Transformer les membres en format attendu
  const getFormattedMembers = (memberIds: string[]): Member[] => {
    return memberIds.map(memberId => {
      const project = projects.find(p => p.members.includes(memberId));
      return {
        id: memberId,
        name: project?.name || 'Membre',
        role: 'Participant',
        email: userData?.email
      };
    });
  };

  if (loadingEvents) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">📅 Planning du projet</h1>
          <div className="text-gray-600 text-sm mb-2">{project?.projectName}</div>
          {events.length === 0 && (
            <p className="text-sm text-gray-500 max-w-2xl">
              Constitue le planning de ton projet avec par exemple les plénières,
              conférences, ateliers, ou tout autre type d'événement. Organise ainsi l'agenda de l'équipe
              en ajoutant les dates, horaires et lieux de chaque activité.
            </p>
          )}
        </div>
        {events.length > 0 && (
          <Button
            variant="primary"
            size="default"
            onClick={handleAddEvent}
          >
            + Ajouter un événement
          </Button>
        )}
      </div>

      <div>
        {events.length === 0 ? (
          <EmptyState
            onAddEvent={handleAddEvent}
            onDuplicatePlanning={async (sourceProjectId) => {
              // TODO: Implémenter la duplication du planning
              await refreshEvents();
            }}
          />
        ) : (
          <div className="space-y-8">
            {planningData.dates.map(date => (
              <div key={date}>
                <div className="p-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr }).toUpperCase()}
                  </h2>
                </div>
                <Card className="p-4 space-y-6">
                  {Object.entries(planningData.eventsByDate[date]).map(([location, locationEvents]) => (
                    <div key={location}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          <span className="text-base font-semibold text-[#0a1747]">
                            {location || 'Lieu non renseigné'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-[#19789b] text-white hover:bg-[#145a75] transition"
                          title="Ajouter un événement à ce lieu"
                          onClick={() => handleAddEventWithPreset(date, location)}
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {locationEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition cursor-pointer"
                            onClick={() => {
                              setSelectedEvent(event);
                              setDetailsModalOpen(true);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{event.title}</h3>
                                <p className="text-sm text-gray-500">
                                  {formatHour(event.startTime)} - {formatHour(event.endTime)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {event.members?.length > 0 && (
                                  <div className="flex -space-x-2">
                                    {event.members.slice(0, 3).map((memberId: string) => {
                                      const member = projects.find((p) => p.members.includes(memberId));
                                      return (
                                        <div
                                          key={memberId}
                                          className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
                                          title={member?.name || 'Membre'}
                                        />
                                      );
                                    })}
                                    {event.members.length > 3 && (
                                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                                        +{event.members.length - 3}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un événement"
      >
        <CreateEventForm
          projectId={project?.id || ''}
          onClose={() => {
            setIsModalOpen(false);
            refreshEvents();
          }}
          presetDate={presetDate}
          presetLocation={presetLocation}
        />
      </Modal>

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedEvent(null);
          }}
          members={getFormattedMembers(selectedEvent.members || [])}
        />
      )}
    </div>
  );
} 