/** =====================================================================
 *  Service d’accès à l’API /predict-propagation
 *  =====================================================================*/

import { PropagationPrediction } from "@/types/entities/PropagationPrediction";

const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/api/predict-propagation`;

type ApiResponse = {
  success: boolean;
  source_node: string;
  hours_ahead: number;
  propagation_predictions: PropagationPrediction[];
};

/** Appel unitaire ------------------------------------------------------*/
async function predict(nodeId: string, hoursAhead = 48) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ node_id: nodeId, hours_ahead: hoursAhead }),
  });

  if (!res.ok) {
    throw new Error(
      `API propagation ${res.status} ${res.statusText} (${nodeId})`
    );
  }

  const json: ApiResponse = await res.json();
  if (!json.success) throw new Error(`API propagation KO (${nodeId})`);

  return json.propagation_predictions;
}

/** Appel “bulk” : plusieurs foyers à la suite --------------------------*/
async function bulkPredict(
  nodeIds: string[],
  hoursAhead = 48
): Promise<Record<string, PropagationPrediction[]>> {
  const results: Record<string, PropagationPrediction[]> = {};

  // ⚠️ laisse les requêtes se faire en parallèle
  await Promise.all(
    nodeIds.map(async (id) => {
      try {
        results[id] = await predict(id, hoursAhead);
      } catch (err) {
        console.error(err);
      }
    })
  );

  return results;
}

export const PropagationService = { bulkPredict };
