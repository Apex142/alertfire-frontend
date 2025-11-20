import { FireAlertService } from "@/services/FireAlertService";
import { FireAlert } from "@/types/entities/FireAlerts";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Hook temps-réel sur les alertes feu.
 * – activeProjectIds : Set des project_id actuellement “on fire”
 */
export function useFireAlerts() {
  const [alerts, setAlerts] = useState<FireAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FireAlertService.getAll();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  }, []);

  /* abonnement temps-réel */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const unsubscribe = FireAlertService.subscribe(
      (data) => {
        if (cancelled) return;
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error("Erreur inconnue"));
        setLoading(false);
      }
    );

  // Bootstrap fetch avoids hanging when the realtime channel is slow.
  (async () => {
      try {
        const data = await FireAlertService.getAll();
        if (cancelled) return;
        setAlerts(data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error("Erreur inconnue"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
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
    refresh: fetchAlerts,
  };
}
