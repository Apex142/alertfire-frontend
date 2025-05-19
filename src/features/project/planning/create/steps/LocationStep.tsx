import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import InputAddressAutocomplete from '@/components/ui/InputAddressAutocomplete';
import type { EventFormData } from '../CreateEventForm';

interface Location {
  id: string;
  label: string;
  address: string;
}

interface LocationStepProps {
  data: EventFormData;
  updateData: (data: Partial<EventFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function LocationStep({ data, updateData, onNext, onBack }: LocationStepProps) {
  const [locationOption, setLocationOption] = useState<'select' | 'search' | 'create'>('select');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);

  // Simuler des lieux existants (à remplacer par les données réelles)
  const existingLocations: Location[] = [
    { id: '1', label: 'Salle de conférence A', address: '123 rue Example' },
    { id: '2', label: 'Auditorium B', address: '456 avenue Test' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (locationOption === 'select' && !data.location_id) {
      newErrors.location = 'Veuillez sélectionner un lieu';
    } else if (locationOption === 'create') {
      if (!data.location_label) newErrors.location_label = 'Le nom du lieu est requis';
      if (!data.location_address) newErrors.location_address = 'L\'adresse est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Simuler une recherche (à remplacer par une vraie recherche)
    const results = existingLocations.filter(loc =>
      loc.label.toLowerCase().includes(query.toLowerCase()) ||
      loc.address.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment souhaitez-vous ajouter un lieu ?
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            className={`p-4 border rounded-lg text-center ${locationOption === 'select'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => setLocationOption('select')}
          >
            Sélectionner un lieu existant
          </button>
          <button
            className={`p-4 border rounded-lg text-center ${locationOption === 'search'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => setLocationOption('search')}
          >
            Rechercher un lieu
          </button>
          <button
            className={`p-4 border rounded-lg text-center ${locationOption === 'create'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => setLocationOption('create')}
          >
            Créer un nouveau lieu
          </button>
        </div>
      </div>

      {locationOption === 'select' && (
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Sélectionner un lieu
          </label>
          <Select
            id="location"
            value={data.location_id || ''}
            onChange={(e) => {
              const location = existingLocations.find(loc => loc.id === e.target.value);
              updateData({
                location_id: e.target.value,
                location_label: location?.label,
                location_address: location?.address,
              });
            }}
            className={errors.location ? 'border-red-500' : ''}
          >
            <option value="">Sélectionner un lieu</option>
            {existingLocations.map(location => (
              <option key={location.id} value={location.id}>
                {location.label}
              </option>
            ))}
          </Select>
          {errors.location && (
            <p className="mt-1 text-sm text-red-500">{errors.location}</p>
          )}
        </div>
      )}

      {locationOption === 'search' && (
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Rechercher un lieu
          </label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher par nom ou adresse..."
          />
          {searchResults.length > 0 && (
            <div className="mt-2 border rounded-lg divide-y">
              {searchResults.map(location => (
                <button
                  key={location.id}
                  className="w-full p-3 text-left hover:bg-gray-50"
                  onClick={() => {
                    updateData({
                      location_id: location.id,
                      location_label: location.label,
                      location_address: location.address,
                    });
                    onNext();
                  }}
                >
                  <div className="font-medium">{location.label}</div>
                  <div className="text-sm text-gray-500">{location.address}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {locationOption === 'create' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="location_label" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du lieu
            </label>
            <Input
              id="location_label"
              value={data.location_label || ''}
              onChange={(e) => updateData({ location_label: e.target.value })}
              placeholder="Ex: Salle de conférence principale"
              className={errors.location_label ? 'border-red-500' : ''}
            />
            {errors.location_label && (
              <p className="mt-1 text-sm text-red-500">{errors.location_label}</p>
            )}
          </div>

          <div>
            <label htmlFor="location_address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <InputAddressAutocomplete
              value={data.location_address || ''}
              onChange={(value) => updateData({ location_address: value })}
              onSelect={(address) => updateData({ location_address: address })}
              placeholder="Ex: 123 rue Example, 75000 Paris"
              error={errors.location_address}
            />
            {errors.location_address && (
              <p className="mt-1 text-sm text-red-500">{errors.location_address}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Retour
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
} 