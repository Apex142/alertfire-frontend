import { Clock } from "lucide-react";

interface Event {
  id: string;
  time: string; // "07:00"
  label: string;
  type: "Tournage" | "Montage" | "Repérage" | string;
}

interface DailyScheduleProps {
  events: Event[];
}

const typeColors: Record<string, string> = {
  Tournage: "bg-blue-100 text-blue-700",
  Montage: "bg-purple-100 text-purple-700",
  Repérage: "bg-orange-100 text-orange-700",
};

export const DailySchedule = ({ events }: DailyScheduleProps) => (
  <div
    className="
      bg-white rounded-2xl shadow-md border border-slate-100
      p-3 sm:p-5 w-full max-w-full
    "
  >
    <div className="flex items-center gap-2 mb-4">
      <Clock className="w-5 h-5 text-primary" />
      <div className="font-bold text-gray-900 text-base sm:text-lg">
        Planning de la journée
      </div>
    </div>
    <ul
      className="
        relative
        space-y-0.5
        before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-primary/10
        sm:before:left-6
      "
    >
      {events.map((ev) => (
        <li
          key={ev.id}
          className="
            flex items-center gap-2 sm:gap-4 relative group
            py-2 sm:py-3
          "
        >
          {/* Timeline dot */}
          <span className="absolute left-4 sm:left-5 top-2 sm:top-1.5 z-10">
            <span
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full block 
                ${typeColors[ev.type] || "bg-gray-200"}
                border-2 border-white shadow-sm`}
            />
          </span>
          {/* Heure */}
          <span className="font-mono text-xs text-gray-500 w-12 pl-3 select-none">
            {ev.time}
          </span>
          {/* Type badge */}
          <span
            className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold border
              ${
                typeColors[ev.type] ||
                "bg-gray-100 text-gray-700 border-gray-200"
              }
              border-opacity-40 shadow-sm`}
          >
            {ev.type}
          </span>
          {/* Label */}
          <span className="ml-1 text-gray-900 font-medium truncate text-sm sm:text-base">
            {ev.label}
          </span>
        </li>
      ))}
    </ul>
  </div>
);
