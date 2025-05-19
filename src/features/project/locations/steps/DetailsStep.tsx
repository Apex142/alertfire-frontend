import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import InputAddressAutocomplete from '@/components/ui/InputAddressAutocomplete';
import { StepProps } from '../types';

export function DetailsStep({ state, onChange, companyLocations, publicLocations }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-lg font-medium text-gray-900">
        {state.locationType === 'new' ? 'Informations du nouveau lieu' :
          state.locationType === 'public' ? 'Sélectionner un lieu public' :
            'Sélectionner un lieu favori'}
      </h2>

      {state.locationType === 'saved' && (
        <div className="space-y-4">
          <select
            value={state.selectedSavedLocation}
            onChange={(e) => onChange({ selectedSavedLocation: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2"
          >
            <option value="">Choisir un lieu...</option>
            {companyLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.label} - {location.address}
              </option>
            ))}
          </select>
        </div>
      )}

      {state.locationType === 'public' && (
        <div className="space-y-4">
          <select
            value={state.selectedPublicLocation}
            onChange={(e) => onChange({ selectedPublicLocation: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2"
          >
            <option value="">Rechercher un lieu...</option>
            {publicLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.label} - {location.address}
              </option>
            ))}
          </select>
        </div>
      )}

      {state.locationType === 'new' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du lieu
            </label>
            <Input
              id="name"
              value={state.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Ex: Amphithéatre 2, Local, etc."
              required
            />
          </div>

          <div>
            <InputAddressAutocomplete
              value={state.address}
              onChange={(value) => onChange({ address: value })}
              onSelect={(value) => onChange({ address: value })}
              placeholder="Adresse du lieu"
              types={['address']}
            />
          </div>

          {state.address && (
            <div className="w-full h-40 rounded overflow-hidden">
              <iframe
                title="Carte"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(state.address)}&output=embed`}
              />
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <Input
              id="notes"
              value={state.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Informations complémentaires..."
            />
          </div>
        </div>
      )}
    </motion.div>
  );
} 