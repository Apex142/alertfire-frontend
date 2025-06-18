// src/hooks/useUser.ts (ou useUsers.ts pour la cohérence)

import { userService } from "@/services/UserService";
import { User } from "@/types/entities/User";
import { useEffect, useState } from "react";

/**
 * Hook pour récupérer la liste des utilisateurs.
 * Gère les états de chargement et d'erreur.
 */
export const useUsers = () => {
  // Le type est User[] car le hook retourne les entités complètes.
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        // On utilise la méthode du service pour récupérer les données.
        const fetchedUsers = await userService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (e: unknown) {
        console.error("useUsers Error:", e);
        if (e instanceof Error) {
          setError(
            e.message ||
              "Une erreur est survenue lors du chargement des utilisateurs."
          );
        } else {
          setError(
            "Une erreur est survenue lors du chargement des utilisateurs."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Le tableau de dépendances vide assure que l'effet ne s'exécute qu'une fois.
  }, []);

  return { users, loading, error };
};
