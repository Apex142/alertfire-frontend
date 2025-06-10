// components/dashboard/SidebarCalendarList.tsx
import { Check } from "lucide-react";

export interface CalendarOption {
  id: string;
  label: string;
  color: string;
  checked: boolean;
}

interface SidebarCalendarListProps {
  calendars: CalendarOption[];
  showCalendars: boolean;
  onToggleShow: () => void;
  onToggleCalendar: (id: string) => void;
}

export function SidebarCalendarList({
  calendars,
  showCalendars,
  onToggleShow,
  onToggleCalendar,
}: SidebarCalendarListProps) {
  return (
    <div className="w-64 border-r border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-900">Mes agendas</h2>
        <button
          onClick={onToggleShow}
          className="text-gray-500 hover:text-gray-700"
        >
          {showCalendars ? (
            <span>
              <svg width={16} height={16} viewBox="0 0 16 16">
                <path
                  d="M12 10L8 6 4 10"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          ) : (
            <span>
              <svg width={16} height={16} viewBox="0 0 16 16">
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          )}
        </button>
      </div>
      {showCalendars && (
        <div className="space-y-2">
          {calendars.map((calendar) => (
            <label
              key={calendar.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer group"
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={calendar.checked}
                  onChange={() => onToggleCalendar(calendar.id)}
                  className="hidden"
                />
                <div
                  className={`w-4 h-4 rounded ${calendar.color} flex items-center justify-center`}
                >
                  {calendar.checked && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700">{calendar.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
