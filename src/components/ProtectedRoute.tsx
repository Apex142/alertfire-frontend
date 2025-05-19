"use client";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/"); // Redirige vers la page d'accueil (login) si non connecté
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-70px)] items-center justify-center bg-background">
        <div className="text-gray-500 text-lg">Connexion…</div>
      </div>
    );
  }

  // Si connecté, affiche le contenu protégé
  return <>{children}</>;
} 