'use client';

import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';

export default function Home() {
  const [showSignup, setShowSignup] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Rediriger vers le dashboard si l'utilisateur est connecté
  if (user) {
    router.push('/dashboard');
    return null;
  }

  // Afficher un loader si l'authentification est en cours de chargement
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading message="Chargement..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Showmate</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {showSignup ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
          </p>
        </div>

        {showSignup ? (
          <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
        ) : (
          <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
        )}
      </div>
    </div>
  );
}
