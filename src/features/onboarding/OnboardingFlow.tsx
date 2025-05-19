import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import OnboardingHeader from './OnboardingHeader';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import OnboardingStep4 from './OnboardingStep4';
import OnboardingStep5 from './OnboardingStep5';
import OnboardingStep6 from './OnboardingStep6';
import OnboardingStep7 from './OnboardingStep7';
import OnboardingStep8 from './OnboardingStep8';
// Les autres steps seront importés au fur et à mesure
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';

const TOTAL_STEPS = 8;

export default function OnboardingFlow() {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [intent, setIntent] = useState<string | null>(null);

  // Récupère l'étape courante et l'intention depuis Firestore
  useEffect(() => {
    const fetchStep = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const onboardingStep = userDoc.data()?.onboardingStep || 1;
        setStep(onboardingStep);
        setIntent(userDoc.data()?.intent || null);
      }
      setLoading(false);
    };
    fetchStep();
  }, [user]);

  const goToNext = () => {
    // Si on est à l'étape 5, aller directement à 8
    setStep((s) => {
      if (s === 5) return 8;
      if (s === 7) return 8;
      return Math.min(s + 1, TOTAL_STEPS);
    });
  };

  // Afficher le loader tant que l'utilisateur ou la step n'est pas connue
  if (loading || !user || !step) {
    return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  }

  // Définir la clé unique pour AnimatePresence
  const stepKey = `step-${step}`;

  let StepComponent = null;
  switch (step) {
    case 0:
      StepComponent = <div />;
      break;
    case 1:
      StepComponent = <OnboardingStep1 onNext={goToNext} />;
      break;
    case 2:
      StepComponent = <OnboardingStep2 onNext={goToNext} />;
      break;
    case 3:
      StepComponent = <OnboardingStep3 onNext={goToNext} />;
      break;
    case 4:
      StepComponent = <OnboardingStep4 onNext={(nextStep) => {
        setTimeout(() => {
          setStep(Number(nextStep));
        }, 100);
      }} />;
      break;
    case 5:
      StepComponent = <OnboardingStep5 onNext={goToNext} />;
      break;
    case 6:
      StepComponent = <OnboardingStep6 onNext={goToNext} />;
      break;
    case 7:
      StepComponent = <OnboardingStep7 onNext={goToNext} />;
      break;
    case 8:
      StepComponent = <OnboardingStep8 onNext={() => {/* redirection finale */ }} />;
      break;
    default:
      StepComponent = <div />;
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingHeader currentStep={step} />
      <div className="pt-8 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <div className="w-full max-w-md mx-auto  flex flex-col items-start justify-center">
              {StepComponent}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 