import Modal from '@/components/ui/Modal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User } from '@/types/user';
import { MapPin } from 'lucide-react';
import { Event } from '@/types/event';

interface EventDetailsModalProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  members: Array<{
    id: string;
    name: string;
    role: string;
    email?: string;
    photoUrl?: string;
  }>;
}

export default function EventDetailsModal({ open, onClose, event, members }: EventDetailsModalProps) {
  if (!event) return null;
  return (
    <Modal open={open} onClose={onClose} title={event.title}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="uppercase text-xs font-semibold text-gray-500 tracking-wider">{event.eventType}</span>
            <span className="text-gray-500 text-xs">{format(new Date(event.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
            <span className="text-gray-500 text-xs">{event.startTime} - {event.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin size={16} />
            <span>{event.locationLabel}</span>
          </div>
          {event.description && <div className="text-gray-700 text-sm mb-2">{event.description}</div>}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Participants ({members.length})</h3>
          <div className="space-y-2">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-2">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm text-gray-600">{member.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
} 