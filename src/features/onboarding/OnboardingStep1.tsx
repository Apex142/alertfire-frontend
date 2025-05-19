import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function OnboardingStep1({ onNext }: { onNext: () => void }) {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(10);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (countdown <= 0) {
      handleStart();
      return;
    }
    intervalRef.current = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [countdown, user]);

  const handleStart = async () => {
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { onboardingStep: 2 }, { merge: true });
    }
    onNext();
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleStart(); }} className="flex flex-col items-center justify-center h-full w-full">
      <h1 className="text-3xl font-bold mb-4 text-center">Bienvenue sur Showmate !</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">Personnalisons ton profil pour que tu puisses utiliser l'application.</p>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full text-lg py-3"
      >
        Commencer ({countdown}s)
      </Button>

    </form>
  );
} 