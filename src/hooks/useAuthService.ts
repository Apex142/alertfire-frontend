"use client";

import { useEffect, useState } from "react";

import type { AuthService } from "@/services/AuthService";

/**
 * Lazily loads the AuthService on the client only to avoid shipping Firebase
 * dependencies in the first paint of the auth screens.
 */
export function useAuthService() {
  const [authService, setAuthService] = useState<AuthService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadService() {
      try {
        const { createAuthService } = await import("@/services/AuthService");
        const instance = await createAuthService();
        if (active) {
          setAuthService(instance);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadService();

    return () => {
      active = false;
    };
  }, []);

  return { authService, loading };
}
