// src/repositories/IFireAlertRepository.ts

import { FireAlert } from "@/types/entities/FireAlerts";

export interface IFireAlertRepository {
  getAll(): Promise<FireAlert[]>;
  getById(id: string): Promise<FireAlert | null>;
  create(alert: FireAlert): Promise<void>;
  update(id: string, alert: Partial<FireAlert>): Promise<void>;
  delete(id: string): Promise<void>; // soft-delete pour garder l’historique
}
