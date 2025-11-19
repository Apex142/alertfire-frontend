"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";

interface RequireAuthOptions {
  redirectTo?: string;
}

export function useRequireAuth(options: RequireAuthOptions = {}) {
  const { appUser, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const isAuthenticated = Boolean(appUser || firebaseUser);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(options.redirectTo ?? "/");
    }
  }, [isAuthenticated, loading, options.redirectTo, router]);

  return {
    isAuthenticated,
    loading,
  };
}
