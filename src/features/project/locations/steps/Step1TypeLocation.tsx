import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LocationType } from '../types';

interface TypeStepProps {
  locationType: LocationType | null;
  onTypeSelect: (type: LocationType) => void;
}

export function TypeStep({ locationType, onTypeSelect }: TypeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-lg font-medium text-gray-900">Choisissez un type de lieu</h2>
      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => onTypeSelect('saved')}
          className={cn(
            'p-4 border rounded-lg text-left transition-colors',
            locationType === 'saved'
              ? 'border-primary bg-primary/5'
              : 'hover:bg-gray-50'
          )}
        >
          <div className="font-medium">Mes lieux favoris</div>
          <p className="text-sm text-gray-500">
            Sélectionnez parmi les lieux déjà enregistrés par votre entreprise
          </p>
        </button>

        <button
          type="button"
          onClick={() => onTypeSelect('public')}
          className={cn(
            'p-4 border rounded-lg text-left transition-colors',
            locationType === 'public'
              ? 'border-primary bg-primary/5'
              : 'hover:bg-gray-50'
          )}
        >
          <div className="font-medium">Lieux publics</div>
          <p className="text-sm text-gray-500">
            Choisissez parmi les lieux publics référencés dans l'application
          </p>
        </button>

        <button
          type="button"
          onClick={() => onTypeSelect('new')}
          className={cn(
            'p-4 border rounded-lg text-left transition-colors',
            locationType === 'new'
              ? 'border-primary bg-primary/5'
              : 'hover:bg-gray-50'
          )}
        >
          <div className="font-medium">Nouveau lieu</div>
          <p className="text-sm text-gray-500">
            Créez un nouveau lieu en renseignant ses informations
          </p>
        </button>
      </div>
    </motion.div>
  );
} 