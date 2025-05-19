interface Event {
  id: string;
  time: string; // "07:00"
  label: string;
  type: 'Tournage' | 'Montage' | 'Repérage' | string;
}

interface DailyScheduleProps {
  events: Event[];
}

const typeColors: Record<string, string> = {
  Tournage: 'bg-blue-100 text-blue-700',
  Montage: 'bg-purple-100 text-purple-700',
  Repérage: 'bg-orange-100 text-orange-700',
};

export const DailySchedule = ({ events }: DailyScheduleProps) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="font-semibold mb-2">Planning de la journée</div>
    <ul className="space-y-2">
      {events.map(ev => (
        <li key={ev.id} className="flex items-center gap-3">
          <span className="font-mono text-sm w-14">{ev.time}</span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[ev.type] || 'bg-gray-100 text-gray-700'}`}>
            {ev.type}
          </span>
          <span>{ev.label}</span>
        </li>
      ))}
    </ul>
  </div>
); 