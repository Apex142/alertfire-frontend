'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';

const filters = [
  { label: 'Tous', value: 'all' },
  { label: 'Mes lieux', value: 'my' },
  { label: 'Publics', value: 'public' },
  { label: 'Favoris', value: 'favorite' },
  { label: 'Collaboratifs', value: 'collab' },
];

interface LocationsHeaderProps {
  onRefresh?: () => void;
}

export default function LocationsHeader({ onRefresh }: LocationsHeaderProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Lieux</h1>
        <p className="text-gray-500">Gérez vos lieux et découvrez de nouveaux espaces</p>
      </div>
      <div className="flex gap-4">
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        )}
        <Button variant="primary">Ajouter un lieu</Button>
      </div>
    </div>
  );
} 