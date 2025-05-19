'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/hooks/useUserData';

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { userData } = useUserData();

  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error('Erreur projet:', error);
  }, [error]);

  const getErrorMessage = () => {
    switch (error.message) {
      case 'PROJECT_NOT_FOUND':
        return {
          title: 'Projet non trouvé',
          message: 'Le projet que vous recherchez n\'existe pas ou a été supprimé.',
          icon: '🔍',
          actions: [
            {
              label: 'Retour au tableau de bord',
              onClick: () => router.push('/dashboard'),
              variant: 'primary' as const,
            },
            {
              label: 'Créer un nouveau projet',
              onClick: () => router.push('/projet/nouveau'),
              variant: 'outline' as const,
            },
          ],
        };

      case 'ACCESS_DENIED':
        return {
          title: 'Accès refusé',
          message: 'Vous n\'avez pas les droits nécessaires pour accéder à ce projet.',
          icon: '🔒',
          actions: [
            {
              label: 'Retour au tableau de bord',
              onClick: () => router.push('/dashboard'),
              variant: 'primary' as const,
            },
            {
              label: 'Demander l\'accès',
              onClick: () => {
                // TODO: Implémenter la demande d'accès
                console.log('Demande d\'accès pour:', userData?.uid);
              },
              variant: 'outline' as const,
            },
          ],
        };

      case 'USER_NOT_FOUND':
        return {
          title: 'Session expirée',
          message: 'Votre session a expiré. Veuillez vous reconnecter.',
          icon: '⏰',
          actions: [
            {
              label: 'Se reconnecter',
              onClick: () => router.push('/auth/login'),
              variant: 'primary' as const,
            },
          ],
        };

      default:
        return {
          title: 'Une erreur est survenue',
          message: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
          icon: '⚠️',
          actions: [
            {
              label: 'Retour au tableau de bord',
              onClick: () => router.push('/dashboard'),
              variant: 'primary' as const,
            },
            {
              label: 'Réessayer',
              onClick: () => reset(),
              variant: 'outline' as const,
            },
          ],
        };
    }
  };

  const { title, message, icon, actions } = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="w-full"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>

        {error.digest && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Code d'erreur : {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 