import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import Stepper from '@/components/ui/Stepper';
import BasicInfoStep from './steps/BasicInfoStep';
import LocationStep from './steps/LocationStep';
import ParticipantsStep from './steps/ParticipantsStep';
import ValidationStep from './steps/ValidationStep';
import { createEvent } from './createEvent';

interface CreateEventFormProps {
  projectId: string;
  onClose: () => void;
  presetDate?: string | null;
  presetLocation?: string | null;
}

export interface EventFormData {
  title: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  locationLabel?: string;
  locationAddress?: string;
  members: Array<{ userId: string; role: string }>;
  notifyMembers: boolean;
}

const steps = [
  { id: 'basic', label: 'Informations' },
  { id: 'location', label: 'Lieu' },
  { id: 'members', label: 'Membres' },
  { id: 'validation', label: 'Validation' },
];

export default function CreateEventForm({ projectId, onClose, presetDate, presetLocation }: CreateEventFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    eventType: '',
    date: presetDate || '',
    startTime: '',
    endTime: '',
    locationId: presetLocation || '',
    locationLabel: presetLocation || '',
    members: [],
    notifyMembers: false,
  });

  // Si presetDate ou presetLocation changent (ex: ouverture du modal), on met à jour le formData
  useEffect(() => {
    setFormData(prev => {
      // Ne mettre à jour que si les valeurs sont différentes
      const newDate = presetDate || prev.date;
      const newLocationId = presetLocation || prev.locationId;
      const newLocationLabel = presetLocation || prev.locationLabel;

      if (newDate === prev.date &&
        newLocationId === prev.locationId &&
        newLocationLabel === prev.locationLabel) {
        return prev;
      }

      return {
        ...prev,
        date: newDate,
        locationId: newLocationId,
        locationLabel: newLocationLabel,
      };
    });
  }, [presetDate, presetLocation]);

  const updateFormData = (data: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const eventId = await createEvent({
        projectId: projectId,
        title: formData.title,
        eventType: formData.eventType,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        locationId: formData.locationId,
        locationLabel: formData.locationLabel,
        locationAddress: formData.locationAddress,
        members: formData.members,
        notifyMembers: formData.notifyMembers,
      });

      console.log('Événement créé avec succès, ID:', eventId);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      // TODO: Afficher une notification d'erreur à l'utilisateur
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            projectId={projectId}
          />
        );
      case 1:
        return (
          <LocationStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <ParticipantsStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
            projectId={projectId}
          />
        );
      case 3:
        return (
          <ValidationStep
            data={formData}
            onSubmit={handleSubmit}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

      {/* Contenu du formulaire */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 