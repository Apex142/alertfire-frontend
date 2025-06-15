/** Structure renvoyée par l’API /predict-propagation */
export interface PropagationPrediction {
  /** identifiant du nœud source ( = project_id ) */
  node_id: string;
  /** vrai si le feu atteindra au moins un autre nœud dans la fenêtre d’anticipation */
  will_reach: boolean;
  /** temps estimé avant impact (heures) ; = -1 si non-atteint */
  time_to_reach_hours: number;
}
