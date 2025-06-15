import React from 'react';

interface StatusBadgeProps {
  status: 'validé' | 'en attente' | 'annulé' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let color = 'bg-gray-200 text-gray-700';
  if (status === 'validé' || status === 'Confirmé') color = 'bg-green-100 text-green-700';
  if (status === 'en attente' || status === 'Optionnel') color = 'bg-yellow-100 text-yellow-700';
  if (status === 'annulé') color = 'bg-red-100 text-red-700';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}; 