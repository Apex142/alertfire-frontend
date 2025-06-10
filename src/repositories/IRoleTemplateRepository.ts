// src/repositories/IRoleTemplateRepository.ts

import { RoleTemplate } from "@/types/entities/RoleTemplate";

export interface IRoleTemplateRepository {
  /**
   * Récupère tous les modèles de rôle depuis la source de données.
   */
  getAll(): Promise<RoleTemplate[]>;
}
