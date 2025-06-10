// src/components/layout/Layout.tsx
"use client";

// useAuth et useTheme ne sont plus directement utilisés par Layout si Navbar gère tout
// import { useAuth } from "@/contexts/AuthContext";
// import { useTheme } from "next-themes";
// import { usePathname, useRouter } from "next/navigation";

import { ReactNode } from "react";
import Navbar from "./Navbar"; // Importer le nouveau Navbar
import ProtectedRoute from "./ProtectedRoute"; // Votre composant de route protégée

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Les hooks et fonctions liés à l'ancien TopMenu (theme, navigation, isActive)
  // sont maintenant gérés directement dans Navbar.tsx ou par ProtectedRoute/AuthContext.

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Navbar /> {/* Utilisation du nouveau Navbar */}
      {/*
        Conteneur pour le contenu principal.
        pt-[65px] pour laisser de la place au Navbar qui a h-[65px].
        pb-[60px] md:pb-0 pour laisser de la place à la nav mobile en bas, si présente.
      */}
      <div className="h-full md:pb-14 pb-32 overflow-y-auto">
        <ProtectedRoute>
          <main className="h-full w-full">
            {" "}
            {/* bg-inherit est optionnel */}
            <div className="p-0 h-full">
              {" "}
              {/* Le padding sera géré par les pages enfants ou ici si global */}
              {children}
            </div>
          </main>
        </ProtectedRoute>
      </div>
    </div>
  );
}
