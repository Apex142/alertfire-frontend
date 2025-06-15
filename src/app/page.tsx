<<<<<<< HEAD
// src/app/page.tsx (ou le chemin vers votre page d'accueil/login)
"use client";

import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { Loading } from "@/components/ui/Loading"; // Assurez-vous que ce chemin est correct
import { useAuth } from "@/contexts/AuthContext"; // <--- CORRIGÉ: Utiliser useAuth
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  // Renommé en HomePage pour plus de clarté si c'est la page d'accueil
  const [showSignup, setShowSignup] = useState(false);
  // Extrait appUser, firebaseUser et loading de useAuth
  const { appUser, firebaseUser, loading } = useAuth();
  const router = useRouter();

  // Détermine si l'utilisateur est authentifié
  const isAuthenticated = !!(appUser || firebaseUser);

  // Rediriger si connecté, mais **uniquement après le loading**
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Afficher un loader si l'auth est en cours de vérification
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-gray-900">
        {/* Assurez-vous que bg-background est défini dans votre Tailwind config ou global.css */}
=======
"use client";

import "leaflet/dist/leaflet.css";
import { useState } from "react";

import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import MapView from "@/components/MapView/MapView"; // ✅ import direct
import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const [showSignup, setShowSignup] = useState(false);
  const { appUser, firebaseUser, loading } = useAuth();
  const isAuthenticated = !!(appUser || firebaseUser);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-gray-900">
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
        <Loading message="Chargement..." size="lg" />
      </div>
    );
  }

<<<<<<< HEAD
  // Si l'utilisateur est authentifié et que le chargement est terminé,
  // on retourne null pour laisser useEffect gérer la redirection.
  // Cela évite d'afficher brièvement le formulaire de connexion/inscription.
  if (isAuthenticated) {
    return null;
  }

  // Si le chargement est terminé et l'utilisateur n'est pas authentifié, afficher les formulaires.
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 dark:bg-gray-900 sm:px-6 lg:px-8">
      {/* J'ai changé bg-background en bg-gray-100 pour un fond clair standard, ajustez selon votre thème */}
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            alertfire {/* Ou le nom de votre application */}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {showSignup
              ? "Créez votre compte pour commencer"
              : "Connectez-vous à votre compte"}
          </p>
        </div>

=======
  if (isAuthenticated) {
    return (
      <main className="h-screen w-screen">
        <MapView />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
        {showSignup ? (
          <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
        ) : (
          <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
        )}
<<<<<<< HEAD

        {/* Optionnel: Lien pour basculer manuellement si les formulaires ne l'incluent pas déjà */}
        <div className="text-center text-sm">
          {showSignup ? (
            <p className="text-gray-600 dark:text-gray-400">
              Déjà un compte ?{" "}
              <button
                onClick={() => setShowSignup(false)}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Se connecter
              </button>
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Pas encore de compte ?{" "}
              <button
                onClick={() => setShowSignup(true)}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                S'inscrire
              </button>
            </p>
          )}
        </div>
=======
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
      </div>
    </div>
  );
}
