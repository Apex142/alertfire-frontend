"use client";

import EmptyState from "@/components/project/planning/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import CreateEventForm from "@/features/project/planning/create/CreateEventForm";
import type { Project, ProjectDayEvent } from "@/types/entities/Project";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import EventDetailsModal from "./EventDetailsModal";

// Suppose que tu passes project (objet complet) et refreshEvents en props,
// ou récupère-les avec useProject si besoin.
interface PlanningPageProps {
  project: Project | null;
  refreshEvents: () => Promise<void>;
  loading?: boolean;
}

function formatHour(ts?: any) {
  if (!ts) return "";
  // Firestore Timestamp > JS Date
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    .replace(":", "h");
}

export default function PlanningPage({
  project,
  refreshEvents,
  loading,
}: PlanningPageProps) {
  const { appUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presetDate, setPresetDate] = useState<string | null>(null);
  const [presetLocation, setPresetLocation] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ProjectDayEvent | null>(
    null
  );
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Récupère tous les events groupés par date puis lieu
  const planningData = useMemo(() => {
    if (!project?.dayPlannings) return { dates: [], eventsByDate: {} };
    // { date: { locationLabel: [events] } }
    const eventsByDate: Record<string, Record<string, ProjectDayEvent[]>> = {};
    project.dayPlannings.forEach((dayPlanning) => {
      if (!eventsByDate[dayPlanning.date]) eventsByDate[dayPlanning.date] = {};
      dayPlanning.events.forEach((event) => {
        const loc = event.location || "Lieu non renseigné";
        if (!eventsByDate[dayPlanning.date][loc])
          eventsByDate[dayPlanning.date][loc] = [];
        eventsByDate[dayPlanning.date][loc].push(event);
      });
    });
    // Trie les dates
    const sortedDates = Object.keys(eventsByDate).sort();
    return { dates: sortedDates, eventsByDate };
  }, [project]);

  // Ouvre la modale avec préremplissage
  const handleAddEventWithPreset = (date: string, location: string) => {
    setPresetDate(date);
    setPresetLocation(location);
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setPresetDate(null);
    setPresetLocation(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Compte le nombre total d'events pour savoir si c'est vide
  const totalEvents = useMemo(() => {
    return planningData.dates.reduce((acc, date) => {
      return (
        acc +
        Object.values(planningData.eventsByDate[date] || {}).reduce(
          (sum, arr) => sum + arr.length,
          0
        )
      );
    }, 0);
  }, [planningData]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">📅 Planning du projet</h1>
          <div className="text-gray-600 text-sm mb-2">
            {project?.projectName}
          </div>
          {totalEvents === 0 && (
            <p className="text-sm text-gray-500 max-w-2xl">
              Constitue le planning de ton projet&nbsp;: ajoute les tournages,
              pauses, montages, etc. Organise chaque journée en précisant la
              date, l’horaire et le lieu de chaque événement.
            </p>
          )}
        </div>
        <Button variant="primary" size="default" onClick={handleAddEvent}>
          + Ajouter un événement
        </Button>
      </div>

      <div>
        {totalEvents === 0 ? (
          <EmptyState
            onAddEvent={handleAddEvent}
            onDuplicatePlanning={async (sourceProjectId) => {
              // TODO: implémenter la duplication
              await refreshEvents();
            }}
          />
        ) : (
          <div className="space-y-8">
            {planningData.dates.map((date) => (
              <div key={date}>
                <div className="p-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {format(new Date(date), "EEEE d MMMM yyyy", {
                      locale: fr,
                    }).toUpperCase()}
                  </h2>
                </div>
                <Card className="p-4 space-y-6">
                  {Object.entries(planningData.eventsByDate[date]).map(
                    ([location, locationEvents]) => (
                      <div key={location}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-500" />
                            <span className="text-base font-semibold text-[#0a1747]">
                              {location}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-[#19789b] text-white hover:bg-[#145a75] transition"
                            title="Ajouter un événement à ce lieu"
                            onClick={() =>
                              handleAddEventWithPreset(date, location)
                            }
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
                                  <h3 className="font-medium text-gray-900">
                                    {event.label}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {formatHour(event.startTime)}
                                    {event.endTime &&
                                      ` - ${formatHour(event.endTime)}`}
                                  </p>
                                  {event.type && (
                                    <div className="mt-1 text-xs text-blue-700 font-semibold uppercase">
                                      {event.type}
                                    </div>
                                  )}
                                </div>
                                {/* Ajoute ici les participants ou autre info */}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
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
          projectId={project?.id || ""}
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
          // Ajoute ici la gestion des membres si tu veux
          members={[]}
        />
      )}
    </div>
  );
}
