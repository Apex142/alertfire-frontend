import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Loading } from "@/components/ui/Loading";
import { useProjectContext } from "@/contexts/ProjectContext";
import { notify } from "@/lib/notify";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState } from "react";

interface Event {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface StepEventsProps {
  selectedEvents: string[];
  setSelectedEvents: (events: string[]) => void;
  linkType: "project" | "events";
  onNext?: () => void;
}

function formatHour(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  return `${h}H${m}`;
}

function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) {
      return dateStr;
    }
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  } catch (error) {
    console.error("Erreur de formatage de date:", error);
    return dateStr;
  }
}

export default function StepEvents({
  selectedEvents,
  setSelectedEvents,
  linkType,
  onNext,
}: StepEventsProps) {
  const { events, loadingEvents } = useProjectContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Grouper les événements par date avec useMemo pour éviter les recalculs inutiles
  const { eventsByDate, uniqueDates } = useMemo(() => {
    const grouped = events.reduce((acc, event) => {
      const date = event.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as Record<string, Event[]>);

    return {
      eventsByDate: grouped,
      uniqueDates: Object.keys(grouped).sort(),
    };
  }, [events]);

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(
      selectedEvents.includes(eventId)
        ? selectedEvents.filter((id) => id !== eventId)
        : [...selectedEvents, eventId]
    );
    setError(null);
  };

  const handleNext = () => {
    if (selectedEvents.length === 0) {
      setError("Veuillez sélectionner au moins un événement");
      notify.error("Veuillez sélectionner au moins un événement");
      return;
    }
    onNext?.();
  };

  // Vue 1 : liste des dates
  if (!selectedDate) {
    if (loadingEvents) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loading message="Chargement des événements..." />
        </div>
      );
    }

    return (
      <div>
        <h3 className="font-medium mb-4">
          Sélectionnez une date pour voir les événements :
        </h3>
        <div className="flex flex-wrap gap-3">
          {uniqueDates.length === 0 && (
            <div className="text-gray-500">Aucune date disponible.</div>
          )}
          {uniqueDates.map((date) => (
            <Button
              key={date}
              variant="secondary"
              onClick={() => setSelectedDate(date)}
              className="mb-2"
            >
              {formatDate(date)}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Vue 2 : liste des événements pour la date sélectionnée
  const eventsForDate = eventsByDate[selectedDate] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Sélectionnez les événements</h3>
        <Button
          variant="secondary"
          onClick={() => setSelectedDate(null)}
          className="text-sm"
        >
          Changer de date
        </Button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-600 bg-red-50 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">
          {formatDate(selectedDate)}
        </h4>
        <div className="space-y-2">
          {eventsForDate.map((event) => (
            <div key={event.id} className="flex items-center space-x-2">
              <Checkbox
                id={event.id}
                checked={selectedEvents.includes(event.id)}
                onChange={() => handleEventToggle(event.id)}
              />
              <label htmlFor={event.id} className="text-sm">
                {event.title} ({formatHour(event.start_time)} -{" "}
                {formatHour(event.end_time)})
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={selectedEvents.length === 0}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
