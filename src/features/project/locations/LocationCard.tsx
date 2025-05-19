import { MapPin, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LocationCardProps {
  label: string;
  address: string;
  notes?: string;
  onEdit?: () => void;
}

export default function LocationCard({
  label,
  address,
  notes,
  onEdit,
}: LocationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex items-start gap-6 p-4">
        {/* Colonne gauche */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-primary w-5 h-5 flex-shrink-0" />
            <h3 className="font-semibold text-lg truncate">{label}</h3>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={onEdit}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-500 uppercase mb-1">Adresse</div>
              <div className="text-sm break-words">{address}</div>
            </div>

            {notes && (
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Note d'accès</div>
                <div className="text-sm break-words">{notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Carte à droite */}
        <div className="w-72 h-40 rounded overflow-hidden flex-shrink-0">
          <iframe
            title="Carte"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          />
        </div>
      </div>
    </div>
  );
} 