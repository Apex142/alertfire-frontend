import { formatHour } from '@/lib/utils/date';
import { Badge } from '@/components/ui/Badge';

interface EventCardProps {
  event: {
    start_time: string;
    event_type: string;
    title: string;
    location_label: string;
    members: string[];
  };
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Badge variant="outline" className="shrink-0">
          {formatHour(event.start_time)}
        </Badge>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{event.title}</span>
            <Badge variant="secondary" className="text-xs">
              {event.event_type}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{event.location_label}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              👤 {event.members.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 