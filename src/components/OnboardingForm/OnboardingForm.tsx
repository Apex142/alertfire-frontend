'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, List, Check, Target } from 'lucide-react';
import { notify } from '@/lib/notify';
import IdentityStep from './steps/IdentityStep';
import IntentStep from './steps/IntentStep';
import KeyInfoStep from './steps/KeyInfoStep';

// Schéma complet pour la validation finale
const completeSchema = z.object({
  // Identity
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  // Intent
  userIntent: z.enum(['organizer', 'technician', 'unknown']),
  structureType: z.enum(['independent', 'join', 'create']).optional(),
  structureName: z.string().optional(),
  joinStructure: z.string().optional(),
  statuses: z.array(z.enum(['Salarié', 'Bénévole', 'Intermittent', 'Autoentrepreneur'])).optional(),
  // Key Info
  languages: z.array(z.string()).optional(),
  licenses: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof completeSchema>;

const steps = [
  {
    title: 'Identité',
    subtitle: 'Prénom, nom, téléphone…',
    icon: <User className="w-5 h-5" />,
    component: IdentityStep,
  },
  {
    title: 'Intention',
    subtitle: 'Comment allez-vous utiliser Showmate ?',
    icon: <Target className="w-5 h-5" />,
    component: IntentStep,
  },
  {
    title: 'Informations complémentaires',
    subtitle: 'Langues, licences…',
    icon: <List className="w-5 h-5" />,
    component: KeyInfoStep,
  },
];

const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(completeSchema),
    mode: 'onChange',
  });

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      // Sauvegarder l'étape actuelle dans Firestore
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            onboardingStep: currentStep,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de l\'étape:', error);
          notify.error('Erreur lors de la sauvegarde de l\'étape.');
          return;
        }
      }
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      const userData = {
        ...data,
        onboardingStep: steps.length, // Dernière étape
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      notify.success('Profil complété avec succès !');
      router.push('/profile');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      notify.error('Erreur lors de la sauvegarde du profil.');
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[80vh]">
          {/* Stepper vertical moderne + bloc user */}
          <div className="hidden lg:flex lg:w-1/2 p-8 flex-col items-center justify-between bg-primary-contrast">
            <div className="w-full flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-white">Showmate</h1>
                <h2 className="text-white/80 text-sm">Première connexion...</h2>
              </div>
              <button
                onClick={handleLogout}
                className="text-white hover:underline cursor-pointer text-sm"
              >
                Déconnexion
              </button>
            </div>
            {/* Stepper Lucide adapté fond sombre */}
            <ol className="relative w-full">
              {steps.map((stepItem, idx) => {
                const isCompleted = currentStep > idx + 1;
                const isCurrent = currentStep === idx + 1;
                return (
                  <li key={stepItem.title} className="last:mb-0 flex items-start relative">
                    <span className="flex flex-col items-center z-10 mt-0.5">
                      <span
                        className={
                          "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200 " +
                          (isCompleted
                            ? "bg-white text-primary border-white"
                            : isCurrent
                              ? "bg-primary text-white border-white"
                              : "bg-white/20 text-white/60 border-white/30")
                        }
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 text-primary" />
                        ) : (
                          stepItem.icon
                        )}
                      </span>
                      {idx < steps.length - 1 && (
                        <span className="w-0.5 h-12 bg-white/30 block mt-0.5"></span>
                      )}
                    </span>
                    <div className="ml-4">
                      <div className={`font-semibold text-base ${isCurrent ? "text-white" : "text-white/80"}`}>
                        {stepItem.title}
                      </div>
                      <div className="text-sm text-white/60">{stepItem.subtitle}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Formulaire */}
          <div className="lg:w-1/2 p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <CurrentStepComponent
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
              />

              <div className="mt-8 flex justify-between">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                  >
                    Retour
                  </Button>
                )}
                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    variant="primary"
                    className="ml-auto"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    className="ml-auto"
                  >
                    Terminer
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm; 