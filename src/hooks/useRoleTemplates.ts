// src/hooks/useRoleTemplates.ts

import { roleTemplateService } from "@/services/RoleTemplateService";
import { RoleTemplate } from "@/types/entities/RoleTemplate";
import { useEffect, useState } from "react";

/**
 * Hook refactorisé pour récupérer les modèles de rôle via le RoleTemplateService.
 */
export function useRoleTemplates() {
  const [roles, setRoles] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // La logique de fetch est maintenant beaucoup plus propre.
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const templates = await roleTemplateService.getAllTemplates();
        setRoles(templates);
      } catch (e: any) {
        setError(
          e.message || "Une erreur est survenue lors du chargement des rôles."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    // La dépendance vide [] assure que l'effet ne s'exécute qu'une seule fois au montage.
  }, []);

  return { roles, loading, error };
}
