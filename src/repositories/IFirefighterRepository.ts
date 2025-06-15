// src/repositories/IFirefighterRepository.ts
import { User } from "@/types/entities/User";

export interface IFirefighterRepository {
  /** Retourne tous les utilisateurs qui possèdent le rôle FIREFIGHTER */
  getAll(): Promise<User[]>;
}
