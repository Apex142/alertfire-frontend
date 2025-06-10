import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import SelectWithSearch from "@/components/ui/SelectWithSearch";
import { useFirestoreDoc } from "@/hooks/useFirestoreDoc";
import { useProject } from "@/hooks/useProjects";
import { db } from "@/lib/firebase";
import type { Event } from "@/types/event";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { EventFormData } from "../CreateEventForm";

interface EventType {
  code: string;
  label: string;
  icon: string;
  color: string;
}

interface BasicInfoStepProps {
  data: EventFormData;
  updateData: (data: Partial<EventFormData>) => void;
  onNext: () => void;
  projectId: string;
}

export default function BasicInfoStep({
  data,
  updateData,
  onNext,
  projectId,
}: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Utiliser les nouveaux hooks avec le cache et le préchargement
  const { data: project } = useProject(projectId, {
    cache: true,
    prefetch: {
      related: [{ collection: "events", field: "projectId", value: projectId }],
    },
  });

  // Charger les événements du project avec le cache
  const { data: events } = useFirestoreDoc<Event[]>("events", projectId, {
    cache: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        const eventTypesRef = collection(db, "event_types");
        const q = query(eventTypesRef, orderBy("label"));
        const snapshot = await getDocs(q);

        const types = snapshot.docs.map((doc) => ({
          ...doc.data(),
          code: doc.id,
        })) as EventType[];

        setEventTypes(types);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des types d'événements:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadEventTypes();
  }, []);

  // Préremplir la date et les heures
  useEffect(() => {
    if (project?.startDate && !data.date) {
      const startDate = new Date(project.startDate);
      const formattedDate = startDate.toISOString().split("T")[0];
      updateData({ date: formattedDate });
    }

    if (events && events.length > 0 && !data.startTime) {
      // Trier les événements par date et heure
      const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.endTime}`);
        const dateB = new Date(`${b.date}T${b.endTime}`);
        return dateB.getTime() - dateA.getTime();
      });

      const lastEvent = sortedEvents[0];
      const lastEventTime = new Date(`${lastEvent.date}T${lastEvent.endTime}`);

      // Ajouter 1 heure à l'heure de fin du dernier événement
      lastEventTime.setHours(lastEventTime.getHours() + 1);

      // Formater l'heure de début
      const startTime = lastEventTime.toTimeString().slice(0, 5);

      // Ajouter 1 heure pour l'heure de fin
      lastEventTime.setHours(lastEventTime.getHours() + 1);
      const endTime = lastEventTime.toTimeString().slice(0, 5);

      updateData({
        startTime,
        endTime,
      });
    }
  }, [project, events, data.date, data.startTime, updateData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.title.trim()) {
      newErrors.title = "Le titre est requis";
    }
    if (!data.eventType) {
      newErrors.eventType = "Le type d'événement est requis";
    }
    if (!data.date) {
      newErrors.date = "La date est requise";
    }
    if (!data.startTime) {
      newErrors.startTime = "L'heure de début est requise";
    }
    if (!data.endTime) {
      newErrors.endTime = "L'heure de fin est requise";
    }

    // Validation des horaires
    if (data.startTime && data.endTime) {
      const start = new Date(`${data.date}T${data.startTime}`);
      const end = new Date(`${data.date}T${data.endTime}`);

      if (end <= start) {
        newErrors.endTime = "L'heure de fin doit être après l'heure de début";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Titre de l'événement
        </label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          className={errors.title ? "border-red-500" : ""}
          placeholder="Ex: Plénière Inaugurale"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="eventType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Type d'événement
        </label>
        <SelectWithSearch
          options={eventTypes.map((type) => ({
            value: type.code,
            label: type.label,
            icon: type.icon,
            color: type.color,
          }))}
          value={data.eventType}
          onChange={(value) => updateData({ eventType: value })}
          placeholder="Sélectionner un type d'événement"
          disabled={isLoading}
          className={errors.eventType ? "border-red-500" : ""}
        />
        {errors.eventType && (
          <p className="mt-1 text-sm text-red-500">{errors.eventType}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date
        </label>
        <Input
          id="date"
          type="date"
          value={data.date}
          onChange={(e) => updateData({ date: e.target.value })}
          className={errors.date ? "border-red-500" : ""}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Heure de début
          </label>
          <Input
            id="startTime"
            type="time"
            value={data.startTime}
            onChange={(e) => updateData({ startTime: e.target.value })}
            className={errors.startTime ? "border-red-500" : ""}
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Heure de fin
          </label>
          <Input
            id="endTime"
            type="time"
            value={data.endTime}
            onChange={(e) => updateData({ endTime: e.target.value })}
            className={errors.endTime ? "border-red-500" : ""}
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleNext}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
