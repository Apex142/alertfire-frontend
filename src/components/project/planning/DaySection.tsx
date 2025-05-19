import { formatDate } from '@/lib/utils/date';
import EventCard from './EventCard';
import { Timestamp } from 'firebase/firestore';

interface Event {
  id: string;
  projectId: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location_label: string;
  location_lat: number;
  location_lng: number;
  members: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface DaySectionProps {
  date: string;
  events: Event[];
}

export default function DaySection({ date, events }: DaySectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {formatDate(date)}
      </h2>
      <div className="space-y-3">
        {events.map((event, index) => (
          <EventCard key={`${event.date}-${event.start_time}-${index}`} event={event} />
        ))}
      </div>
    </div>
  );
} 