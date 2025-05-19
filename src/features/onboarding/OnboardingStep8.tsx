import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useAuth } from '@/hooks/useAuth';
import { motion } from "framer-motion";
import confetti from 'canvas-confetti';
import { useEffect, useState } from "react";
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type Props = { onNext: () => void };

export default function OnboardingStep8({ onNext }: Props) {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Lancer les confetti au chargement
  useEffect(() => {
    triggerConfetti();
  }, []);

  const handleNext = async () => {
    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        onboardingStep: 9,
        onboardingCompleted: true
      }, { merge: true });
    }
    window.location.href = '/';
  };

  // Décrémenter le countdown chaque seconde
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Quand countdown atteint 0, appelle handleNext une seule fois
  useEffect(() => {
    if (countdown === 0) {
      handleNext();
    }
    // eslint-disable-next-line
  }, [countdown]);

  return (
    <div className="flex flex-col items-center justify-center w-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl w-full max-w-lg p-4 sm:p-6 md:p-8 text-center relative mx-2 bg-gradient-to-b from-white to-gray-50 shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Image
            src="/images/ShowmateLogo.png"
            alt="Logo Showmate"
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold mb-6 text-primary"
        >
          🎉 Félicitations {user?.displayName || user?.email?.split('@')[0] || ''} !
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mx-auto max-w-prose space-y-4"
        >
          <p className="text-gray-700 text-lg">
            Ton profil est maintenant prêt ! Tu fais partie de la communauté Showmate.
          </p>

          <div className="bg-primary/5 rounded-xl p-4 mt-6">
            <h3 className="font-semibold text-primary mb-3">Prochaines étapes :</h3>
            <ul className="text-left space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">📱</span> Explore ton tableau de bord
              </li>
              <li className="flex items-center">
                <span className="mr-2">👥</span> Rejoins ou crée ton premier projet
              </li>
              <li className="flex items-center">
                <span className="mr-2">⚡</span> Découvre les toutes les fonctionnalités
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Button
            className="w-full max-w-xs mx-auto"
            onClick={handleNext}
            size="lg"
          >
            Accéder à mon espace {countdown > 0 && `(${countdown}s)`}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 