interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let color = 'bg-gray-200 text-gray-700';
  if (status === 'public') color = 'bg-green-100 text-green-700';
  if (status === 'privé') color = 'bg-blue-100 text-blue-700';
  if (status === 'collaboratif') color = 'bg-yellow-100 text-yellow-700';

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  );
} 