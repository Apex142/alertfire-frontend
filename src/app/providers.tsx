"use client";

import { Loading } from "@/components/ui/Loading";
import { ModalProvider } from "@/components/ui/modal/ModalContext";
import { useUserData } from "@/hooks/useUserData";
import { ThemeProvider } from "next-themes";
import { createContext, ReactNode, useContext } from "react";

// Contexte pour les données utilisateur
export const UserDataContext = createContext<ReturnType<
  typeof useUserData
> | null>(null);

export function useUserDataContext() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error(
      "useUserDataContext doit être utilisé dans un UserDataProvider"
    );
  }
  return context;
}

function UserDataProvider({ children }: { children: ReactNode }) {
  const userData = useUserData(true);

  if (userData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loading
          message="Chargement de votre espace..."
          size="lg"
          className="pt-40"
        />
      </div>
    );
  }

  if (userData.error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400">
            Une erreur est survenue
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {userData.error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <UserDataContext.Provider value={userData}>
      {children}
    </UserDataContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ModalProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <UserDataProvider>{children}</UserDataProvider>
      </ThemeProvider>
    </ModalProvider>
  );
}
