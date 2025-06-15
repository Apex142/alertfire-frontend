// src/repositories/ITechnicianRepository.ts
import { User } from "@/types/entities/User";

export interface ITechnicianRepository {
  /** Renvoie tous les utilisateurs dont le rôle global contient « technicien ». */
  getAll(): Promise<User[]>;
}
