// src/types/entities/RoleTemplate.ts

/**
 * Représente un modèle de rôle stocké dans la collection `role_templates`.
 */
export interface RoleTemplate {
  id: string; // L'ID du document Firestore
  label: string; // Le nom lisible du rôle (ex: "Acteur")
  category: string; // La catégorie du rôle (ex: "Mise en scène")
  icon: string; // L'émoji ou l'icône associé (ex: "🎭")
  isDefault?: boolean; // Indique si c'est un rôle suggéré par défaut
  priority?: number; // Pour trier les rôles dans l'interface (plus le chiffre est bas, plus la priorité est haute)
}
