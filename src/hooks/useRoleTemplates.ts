// src/hooks/useRoleTemplates.ts
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export interface RoleTemplate {
  id: string;
  label: string;
  category: string;
  icon: string;
  priority?: number;
}

export function useRoleTemplates() {
  const [roles, setRoles] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unmounted = false;

    async function fetchRoles() {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, "role_templates"));
        const data = snap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as RoleTemplate)
        );
        if (!unmounted) setRoles(data);
      } catch (e) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : "Erreur lors du chargement des rôles";
        if (!unmounted) setError(errorMessage);
      } finally {
        if (!unmounted) setLoading(false);
      }
    }

    fetchRoles();
    return () => {
      unmounted = true;
    };
  }, []);

  return { roles, loading, error };
}
