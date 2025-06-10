// src/services/RoleTemplateService.ts

import { IRoleTemplateRepository } from "@/repositories/IRoleTemplateRepository";
import { RoleTemplateRepository } from "@/repositories/RoleTemplateRepository";
import { RoleTemplate } from "@/types/entities/RoleTemplate";

export class RoleTemplateService {
  private roleTemplateRepository: IRoleTemplateRepository;

  constructor() {
    // Instanciation de notre repository concret.
    this.roleTemplateRepository = new RoleTemplateRepository();
  }

  /**
   * Récupère la liste de tous les modèles de rôle.
   */
  async getAllTemplates(): Promise<RoleTemplate[]> {
    try {
      console.log("RoleTemplateService: Fetching all role templates...");
      const templates = await this.roleTemplateRepository.getAll();
      return templates;
    } catch (error) {
      console.error(
        "RoleTemplateService: Error fetching role templates:",
        error
      );
      // On propage l'erreur pour que le hook puisse la gérer.
      throw error;
    }
  }
}

// On exporte une instance unique (singleton) pour un accès facile dans l'application.
export const roleTemplateService = new RoleTemplateService();
