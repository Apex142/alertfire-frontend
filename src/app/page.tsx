"use client";

import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { useState } from "react";

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
});
const SignupForm = dynamic(() => import("@/components/auth/SignupForm"), {
  ssr: false,
});

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const [showSignup, setShowSignup] = useState(false);
  const { appUser, firebaseUser, loading } = useAuth();
  const isAuthenticated = !!(appUser || firebaseUser);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-gray-900">
        <Loading message="Chargement…" size="lg" />
      </div>
    );
  }

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
        {showSignup ? (
          <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
        ) : (
          <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
        )}
      </div>
    </div>
  );
}
