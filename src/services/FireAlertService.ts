// src/services/FireAlertService.ts
import { FireAlertRepository } from "@/repositories/FireAlertRepository";
import { FireAlert } from "@/types/entities/FireAlerts";

const repository = new FireAlertRepository();

export const FireAlertService = {
  getAll: (): Promise<FireAlert[]> => repository.getAll(),
  getById: (id: string): Promise<FireAlert | null> => repository.getById(id),
  create: (alert: FireAlert): Promise<void> => repository.create(alert),
  update: (id: string, updates: Partial<FireAlert>): Promise<void> =>
    repository.update(id, updates),
  delete: (id: string): Promise<void> => repository.delete(id),
  subscribe: (
    callback: (alerts: FireAlert[]) => void,
    error?: (e: Error) => void
  ): (() => void) => repository.onSnapshot(callback, error),
};
