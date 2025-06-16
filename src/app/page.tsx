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
        <Loading message="Chargement..." size="lg" />
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
