import { PropagationService } from "@/services/PropagationService";
import { PropagationPrediction } from "@/types/entities/PropagationPrediction";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [refreshToken, setRefreshToken] = useState(0);

  const signature = useMemo(() => {
    if (activeProjectIds.size === 0) return "";
    return Array.from(activeProjectIds).sort().join("|");
  }, [activeProjectIds]);

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // aucun feu → on vide
    if (activeProjectIds.size === 0) {
      setPropagations({});
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let cancelled = false;

  const ids = signature ? signature.split("|") : [];

  PropagationService.bulkPredict(ids, hoursAhead)
      .then((res) => {
        if (cancelled) return;
        setPropagations(res);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e instanceof Error
            ? e
            : new Error("Impossible de récupérer la propagation.")
        );
        setPropagations({});
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, hoursAhead, refreshToken]);

  return { propagations, loading, error, refresh };
}
