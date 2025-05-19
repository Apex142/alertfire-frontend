import { Button } from '@/components/ui/Button';
import type { EventFormData } from '../CreateEventForm';

interface ValidationStepProps {
  data: EventFormData;
  onSubmit: () => void;
  onBack: () => void;
}

export default function ValidationStep({ data, onSubmit, onBack }: ValidationStepProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.replace(':', 'H');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Résumé de l'événement</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Informations de base</h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Titre</span>
                <span className="font-medium">{data.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium">{data.event_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{formatDate(data.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horaires</span>
                <span className="font-medium">
                  {formatTime(data.start_time)} - {formatTime(data.end_time)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Lieu</h4>
            <div className="mt-2">
              <div className="font-medium">{data.location_label}</div>
              <div className="text-gray-600">{data.location_address}</div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-500">Participants</h4>
            <div className="mt-2">
              <div className="font-medium">
                {data.members.length} participant(s)
              </div>
              {data.notify_members && (
                <div className="text-sm text-gray-600 mt-1">
                  Les participants seront notifiés par email
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Retour
        </Button>
        <Button
          variant="primary"
          onClick={onSubmit}
        >
          Créer l'événement
        </Button>
      </div>
    </div>
  );
} 