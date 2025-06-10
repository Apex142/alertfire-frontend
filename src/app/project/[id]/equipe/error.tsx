"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { appUser } = useAuth();

  useEffect(() => {
    console.error("Erreur équipe:", error);
  }, [error]);

  const getErrorMessage = () => {
    switch (error.message) {
      case "ROLES_NOT_FOUND":
        return {
          title: "Rôles non trouvés",
          message: "Impossible de charger les rôles de l'équipe.",
          icon: "👥",
          actions: [
            {
              label: "Réessayer",
              onClick: () => reset(),
              variant: "primary" as const,
            },
            {
              label: "Retour au project",
              onClick: () => router.back(),
              variant: "outline" as const,
            },
          ],
        };

      case "ACCESS_DENIED":
        return {
          title: "Accès refusé",
          message:
            "Vous n'avez pas les droits nécessaires pour gérer l'équipe.",
          icon: "🔒",
          actions: [
            {
              label: "Retour au project",
              onClick: () => router.back(),
              variant: "primary" as const,
            },
            {
              label: "Demander l'accès",
              onClick: () => {
                // TODO: Implémenter la demande d'accès
                console.log("Demande d'accès pour:", appUser?.uid);
              },
              variant: "outline" as const,
            },
          ],
        };

      default:
        return {
          title: "Une erreur est survenue",
          message:
            "Une erreur inattendue s'est produite lors du chargement de l'équipe.",
          icon: "⚠️",
          actions: [
            {
              label: "Réessayer",
              onClick: () => reset(),
              variant: "primary" as const,
            },
            {
              label: "Retour au project",
              onClick: () => router.back(),
              variant: "outline" as const,
            },
          ],
        };
    }
  };

  const { title, message, icon, actions } = getErrorMessage();

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
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
            <p className="text-xs text-gray-500">
              Code d'erreur : {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
