// src/repositories/RoleTemplateRepository.ts

import { db } from "@/lib/firebase/client";
import { RoleTemplate } from "@/types/entities/RoleTemplate";
import {
  collection,
  DocumentData,
  DocumentSnapshot,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { IRoleTemplateRepository } from "./IRoleTemplateRepository";

const ROLE_TEMPLATES_COLLECTION = "role_templates";

/**
 * Fonction utilitaire pour convertir un document Firestore en notre type RoleTemplate.
 */
const mapDocToRoleTemplate = (
  docSnap: DocumentSnapshot<DocumentData>
): RoleTemplate => {
  const data = docSnap.data();
  if (!data) {
    throw new Error(
      `Aucune donnée trouvée pour le modèle de rôle ${docSnap.id}`
    );
  }
  return {
    id: docSnap.id,
    label: data.label || "",
    category: data.category || "Inconnue",
    icon: data.icon || "❓",
    isDefault: data.isDefault || false,
    priority: data.priority || 99, // Une priorité par défaut
  };
};

export class RoleTemplateRepository implements IRoleTemplateRepository {
  private roleTemplatesCollectionRef = collection(
    db,
    ROLE_TEMPLATES_COLLECTION
  );

  async getAll(): Promise<RoleTemplate[]> {
    // On crée une requête qui trie les rôles par priorité croissante.
    const q = query(
      this.roleTemplatesCollectionRef,
      orderBy("priority", "asc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(mapDocToRoleTemplate);
  }
}
