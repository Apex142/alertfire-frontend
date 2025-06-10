// src/components/layout/ProtectedRoute.tsx

import { Loading } from "@/components/ui/Loading"; // Un composant de chargement simple
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation"; // Pour la redirection et obtenir le chemin actuel
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { appUser, firebaseUser, loading } = useAuth(); // Utilise appUser ou firebaseUser
  const router = useRouter();
  const pathname = usePathname(); // Pour savoir où rediriger après le login

  const isAuthenticated = !!appUser || !!firebaseUser; // Considérer l'utilisateur comme authentifié si l'un ou l'autre est présent

  useEffect(() => {
    // Ne pas rediriger pendant le chargement ou si déjà authentifié
    if (loading || isAuthenticated) {
      return;
    }

    // Si le chargement est terminé et l'utilisateur n'est pas authentifié
    if (!isAuthenticated) {
      // Stocker le chemin actuel pour une redirection après le login
      const redirectUrl =
        pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectUrl}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-120px)] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        {/* Ajustez min-h si besoin pour s'adapter à la hauteur de votre contenu principal */}
        <Loading message="Vérification de l'authentification..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Bien que useEffect gère la redirection, ce retour est une sécurité
    // pour éviter d'afficher brièvement les children avant que la redirection ne se produise.
    // Peut aussi afficher un spinner ici si la redirection prend un instant.
    return (
      <div className="flex h-full min-h-[calc(100vh-120px)] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading message="Redirection vers la page de connexion..." />
      </div>
    );
  }

  // Si l'utilisateur est authentifié et le chargement est terminé
  return <>{children}</>;
}
