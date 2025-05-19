import { motion } from 'framer-motion';
import { StepProps } from '../types';

export function PolicyStep({ state, onChange }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-lg font-medium text-gray-900">Politique d'édition</h2>
      <div className="space-y-3">
        <label className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center h-5">
            <input
              type="radio"
              value="private"
              checked={state.editPolicy === 'private'}
              onChange={(e) => onChange({ editPolicy: e.target.value as 'private' })}
              className="mr-2"
            />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Privé</div>
            <p className="text-sm text-gray-500">
              Accès restreint aux membres de l'entreprise et du projet.
              Seuls les membres de l'entreprise peuvent modifier les informations.
            </p>
          </div>
        </label>

        <label className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center h-5">
            <input
              type="radio"
              value="company"
              checked={state.editPolicy === 'company'}
              onChange={(e) => onChange({ editPolicy: e.target.value as 'company' })}
              className="mr-2"
            />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Entreprise</div>
            <p className="text-sm text-gray-500">
              Lieu public visible par tous. Les modifications proposées par la communauté
              doivent être approuvées par un membre de l'entreprise propriétaire.
            </p>
          </div>
        </label>

        <label className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center h-5">
            <input
              type="radio"
              value="creativecommon"
              checked={state.editPolicy === 'creativecommon'}
              onChange={(e) => onChange({ editPolicy: e.target.value as 'creativecommon' })}
              className="mr-2"
            />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Creative Commons</div>
            <p className="text-sm text-gray-500">
              Lieu public collaboratif, modifiable par tous les utilisateurs.
              Fonctionne sur le principe du wiki, avec un historique des modifications.
            </p>
          </div>
        </label>
      </div>
    </motion.div>
  );
} 