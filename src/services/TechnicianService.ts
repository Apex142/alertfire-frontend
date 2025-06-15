// src/services/TechnicianService.ts
import { ITechnicianRepository } from "@/repositories/ITechnicianRepository";
import { TechnicianRepository } from "@/repositories/TechnicianRepository";

export class TechnicianService {
  constructor(
    private repo: ITechnicianRepository = new TechnicianRepository()
  ) {}

  /** Abstraction métier : aujourd’hui simple passthrough */
  getTechnicians() {
    return this.repo.getAll();
  }
}

export const technicianService = new TechnicianService();
