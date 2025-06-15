import { PropagationService } from "@/services/PropagationService";
import { PropagationPrediction } from "@/types/entities/PropagationPrediction";
import { useEffect, useState } from "react";

/**
 * Récupère régulièrement (au montage + quand la liste change) les prédictions
 * de propagation pour les nœuds actifs.
 */
export function usePropagation(activeProjectIds: Set<string>, hoursAhead = 48) {
  const [propagations, setPropagations] = useState<
    Record<string, PropagationPrediction[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // aucun feu → on vide
    if (activeProjectIds.size === 0) {
      setPropagations({});
      return;
    }

    setLoading(true);

    PropagationService.bulkPredict(Array.from(activeProjectIds), hoursAhead)
      .then((res) => {
        console.table(res); // 👈 debug visuel
        setPropagations(res);
      })
      .catch((e) => setError(e instanceof Error ? e : new Error("Unknown")))
      .finally(() => setLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.from(activeProjectIds).join(","), hoursAhead]);

  return { propagations, loading, error };
}
