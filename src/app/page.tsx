"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { BrandLoader } from "@/components/ui/BrandLoader";
import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/contexts/AuthContext";

/* ------------------------------------------------------------------ */
/*  Chargements dynamiques (client-only)                              */
/* ------------------------------------------------------------------ */
const MapView = dynamic(() => import("@/components/MapView/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loading message="Chargement de la carte…" size="lg" />
    </div>
  ),
});

const LoginForm = dynamic(() => import("@/components/auth/LoginForm"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-card/60 p-6 shadow">
      <Loading message="Préparation du formulaire…" size="md" />
    </div>
  ),
});
const SignupForm = dynamic(() => import("@/components/auth/SignupForm"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-card/60 p-6 shadow">
      <Loading message="Préparation du formulaire…" size="md" />
    </div>
  ),
});

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const [showSignup, setShowSignup] = useState(false);
  const { appUser, firebaseUser, loading } = useAuth();
  const isAuthenticated = !!(appUser || firebaseUser);

  useEffect(() => {
    if (showSignup) {
      void import("@/components/auth/LoginForm");
    } else {
      void import("@/components/auth/SignupForm");
    }
  }, [showSignup]);

  if (loading) {
    return <BrandLoader message="Initialisation de votre espace sécurisé" />;
  }

  if (isAuthenticated) {
    return (
      <main className="relative w-full">
        <MapView />
      </main>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center bg-background px-4 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {showSignup ? (
          <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
        ) : (
          <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
        )}
      </div>
    </div>
  );
}
