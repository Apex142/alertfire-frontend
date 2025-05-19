"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import Image from 'next/image';
import { notify } from '@/lib/notify';
import { FirebaseError } from 'firebase/app';

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

// Fonction pour traduire les erreurs Firebase
const getFirebaseErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.';
    case 'auth/invalid-email':
      return 'L\'adresse email n\'est pas valide.';
    case 'auth/operation-not-allowed':
      return 'La création de compte est temporairement désactivée.';
    case 'auth/weak-password':
      return 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';
    case 'auth/network-request-failed':
      return 'Erreur de connexion réseau. Veuillez vérifier votre connexion internet.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez réessayer plus tard.';
    default:
      return 'Une erreur est survenue lors de la création du compte. Veuillez réessayer.';
  }
};

export default function SignupForm({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) {
  const { signUp, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError('');
      await signUp(data.email, data.password);
      notify.success('Inscription réussie !');
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorMessage = getFirebaseErrorMessage(error);
        setError(errorMessage);
      } else {
        const defaultError = 'Une erreur est survenue lors de la création du compte.';
        setError(defaultError);
      }
      console.error('Erreur d\'inscription:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
      notify.success('Inscription Google réussie !');
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorMessage = getFirebaseErrorMessage(error);
        setError(errorMessage);
      } else {
        const defaultError = 'Erreur lors de la connexion avec Google.';
        setError(defaultError);
      }
      console.error('Erreur de connexion Google:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <Image src="/images/ShowmateLogo_CARRE.png" alt="Logo Showmate" width={100} height={100} />
        </div>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Inscrivez-vous sur Showmate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Mot de passe"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Confirmer le mot de passe"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>
          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
          </Button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                Ou continuer avec
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte ?{' '}
            <button
              type="button"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 underline"
              onClick={onSwitchToLogin}
            >
              Se connecter
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 