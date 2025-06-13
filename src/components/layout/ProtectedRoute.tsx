// src/components/layout/ProtectedRoute.tsx

import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { appUser, firebaseUser, currentSessionId, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // L’utilisateur est considéré comme authentifié SEULEMENT si les 3 sont ok
  const isAuthenticated = !!appUser && !!firebaseUser && !!currentSessionId;

  useEffect(() => {
    // Ne pas rediriger pendant le chargement ou si authentifié
    if (loading || (firebaseUser && !currentSessionId) || isAuthenticated) {
      return;
    }

    // Si plus de chargement ET utilisateur non authentifié
    if (!isAuthenticated) {
      const redirectUrl =
        pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectUrl}`);
    }
  }, [
    loading,
    isAuthenticated,
    firebaseUser,
    currentSessionId,
    router,
    pathname,
  ]);

  // Bloque tant qu’on ne sait pas si la session existe
  if (loading || (firebaseUser && !currentSessionId)) {
    return (
      <div className="flex h-full min-h-[calc(100vh-120px)] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading message="Vérification de l'authentification..." />
      </div>
    );
  }

  // Redirige si non authentifié (même sécurité que dans useEffect)
  if (!isAuthenticated) {
    return (
      <div className="flex h-full min-h-[calc(100vh-120px)] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading message="Redirection vers la page de connexion..." />
      </div>
    );
  }

  // Affiche le contenu si tout est ok
  return <>{children}</>;
}
