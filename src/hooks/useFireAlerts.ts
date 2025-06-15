import { FireAlertService } from "@/services/FireAlertService";
import { FireAlert } from "@/types/entities/FireAlerts";
import { useEffect, useMemo, useState } from "react";

/**
 * Hook temps-réel sur les alertes feu.
 * – activeProjectIds : Set des project_id actuellement “on fire”
 */
export function useFireAlerts() {
  const [alerts, setAlerts] = useState<FireAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /* abonnement temps-réel */
  useEffect(() => {
    setLoading(true);

    const unsubscribe = FireAlertService.subscribe(
      (data) => {
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err : new Error("Erreur inconnue"));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* projets en feu = Set pour lookup O(1) */
  const activeProjectIds = useMemo(
    () => new Set(alerts.filter((a) => a.is_fire).map((a) => a.project_id)),
    [alerts]
  );

  return {
    alerts,
    activeProjectIds, // 👈 utilisation pratique côté carte
    loading,
    error,
  };
}
