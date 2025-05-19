interface DaySelectorProps {
  days: Date[];
  selected: Date;
  onDateChange: (date: Date) => void;
}

export const DaySelector = ({ days, selected, onDateChange }: DaySelectorProps) => (
  <div className="flex gap-2 overflow-x-auto py-2">
    {days.map(day => (
      <button
        key={day.toISOString()}
        className={`px-4 py-2 rounded ${selected.toDateString() === day.toDateString() ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        onClick={() => onDateChange(day)}
      >
        {day.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
      </button>
    ))}
  </div>
); 