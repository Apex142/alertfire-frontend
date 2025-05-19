import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const STEPS = [1, 2, 3, 4, 5, 6, 7];

export default function OnboardingHeader({ currentStep }: { currentStep: number }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Calcul de la progression (0 à 1)
  const progress = (currentStep - 1) / (STEPS.length - 1);

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex h-16 justify-between items-center">
          {/* Logo/nom */}
          <Link href="/" className="flex items-center text-xl font-bold text-gray-900">
            Showmate
          </Link>

          {/* Menu utilisateur à droite */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="text-sm text-gray-600">{user.email}</div>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Barre de chargement animée */}
      <div className="w-full h-1 bg-gray-200">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </nav>
  );
} 