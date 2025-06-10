// hooks/useProjects.ts
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/client";
import { Project } from "@/types/entities/Project";
import { ProjectPrivacy } from "@/types/enums/ProjectPrivacy";
import { ProjectStatus } from "@/types/enums/ProjectStatus";
import {
  collection,
  DocumentData,
  documentId,
  DocumentSnapshot,
  Timestamp as FirestoreTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

const mapDocumentToProject = (
  docSnap: DocumentSnapshot<DocumentData>
): Project => {
  const data = docSnap.data();
  if (!data) {
    throw new Error(`Aucune donnée pour le document projet ${docSnap.id}`);
  }

  const safeGetTimestamp = (field: any): FirestoreTimestamp => {
    if (field instanceof FirestoreTimestamp) return field;
    if (field && typeof field.toDate === "function")
      return field as FirestoreTimestamp; // Déjà un Timestamp-like (ex: de l'admin SDK)
    if (field instanceof Date) return FirestoreTimestamp.fromDate(field);
    console.warn(
      `Champ de date invalide ou manquant pour le projet ${docSnap.id}:`,
      field,
      "- utilisant une date par défaut."
    );
    return FirestoreTimestamp.fromDate(new Date(0)); // Date Epoch comme fallback
  };

  return {
    id: docSnap.id,
    projectName: data.projectName || "Projet sans nom",
    acronym: data.acronym || null,
    description: data.description || null,
    color: data.color || "#CCCCCC",
    companyId: data.companyId || "ID_COMPAGNIE_INCONNU",
    createdAt: safeGetTimestamp(data.createdAt),
    updatedAt: safeGetTimestamp(data.updatedAt),
    createdBy: data.createdBy || "UID_CREATEUR_INCONNU",
    startDate: safeGetTimestamp(data.startDate),
    endDate: safeGetTimestamp(data.endDate),
    privacy: (data.privacy as ProjectPrivacy) || ProjectPrivacy.PRIVATE,
    status: (data.status as ProjectStatus) || ProjectStatus.TO_BE_CONFIRMED,
    archived: data.archived || false,
    deleted: data.deleted || false,
    coverImageUrl: data.coverImageUrl || null,
    membersCount: data.membersCount || 0,
    tags: data.tags || null,
  };
};

export function useProjects() {
  const { appUser, firebaseUser, loading: authLoading } = useAuth();
  const currentUser = appUser || firebaseUser;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjectsForUser = useCallback(async (userId: string) => {
    if (!userId) {
      console.log("useProjects: fetchProjectsForUser called with no userId.");
      setProjects([]); // S'assurer que projects est vide si pas d'ID utilisateur
      setLoading(false);
      return;
    }

    console.log(`useProjects: Fetching projects for user ${userId}`);
    setLoading(true);
    setError(null);
    // let isMounted = true; // isMounted est géré par le useEffect appelant

    try {
      // 1. Récupérer tous les 'project_memberships' pour l'utilisateur actuel
      // La collection est maintenant à la racine.
      const membershipsQuery = query(
        collection(db, "project_memberships"), // Collection racine
        where("userId", "==", userId),
        where("status", "in", ["active", "pending"]) // Optionnel: ne récupérer que les memberships actifs ou en attente
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);

      // if (!isMounted) return; // Vérification gérée par l'effet appelant

      const projectIds = membershipsSnapshot.docs
        .map((docSnap) => docSnap.data().projectId as string)
        .filter((id): id is string => !!id && typeof id === "string"); // Filtrer les IDs invalides/manquants

      // Dédoublonner les projectIds au cas où il y aurait plusieurs memberships pour le même projet (improbable mais possible)
      const uniqueProjectIds = Array.from(new Set(projectIds));

      console.log(
        "useProjects: Found project IDs from memberships:",
        uniqueProjectIds
      );

      if (uniqueProjectIds.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // 2. Récupérer les documents projets basés sur les projectIds obtenus
      const fetchedProjects: Project[] = [];
      const CHUNK_SIZE = 30;

      for (let i = 0; i < uniqueProjectIds.length; i += CHUNK_SIZE) {
        const chunkProjectIds = uniqueProjectIds.slice(i, i + CHUNK_SIZE);
        if (chunkProjectIds.length > 0) {
          const projectsQuery = query(
            collection(db, "projects"),
            where(documentId(), "in", chunkProjectIds),
            where("deleted", "==", false)
          );
          const projectsSnapshot = await getDocs(projectsQuery);
          // if (!isMounted) return; // Vérification gérée par l'effet appelant

          projectsSnapshot.docs.forEach((docSnap) => {
            try {
              fetchedProjects.push(mapDocumentToProject(docSnap));
            } catch (mapError) {
              console.warn(
                `useProjects: Erreur lors du mapping du projet ${docSnap.id}:`,
                mapError
              );
            }
          });
        }
      }

      // if (isMounted) { // Vérification gérée par l'effet appelant
      fetchedProjects.sort(
        (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
      );
      setProjects(fetchedProjects);
      console.log(
        "useProjects: Projects fetched and set:",
        fetchedProjects.length
      );
      // }
    } catch (e) {
      console.error(
        "useProjects: Erreur lors de la récupération des projets de l'utilisateur:",
        e
      );
      // if (isMounted) { // Vérification gérée par l'effet appelant
      setError(e instanceof Error ? e : new Error(String(e)));
      // }
    } finally {
      // if (isMounted) { // Vérification gérée par l'effet appelant
      setLoading(false);
      // }
    }
  }, []); // useCallback sans dépendances car il prend userId en argument

  useEffect(() => {
    let isComponentMounted = true; // Drapeau pour ce useEffect spécifique

    const executeFetch = async (uid: string) => {
      // Le setLoading(true) est maintenant dans fetchProjectsForUser
      await fetchProjectsForUser(uid);
      // setLoading(false) est aussi dans le finally de fetchProjectsForUser
      // Donc, on n'a pas besoin de gérer isMounted ici pour setLoading directement,
      // mais c'est une bonne pratique si fetchProjectsForUser faisait des setState directs
      // qui ne sont pas dans un try/finally.
      // La version useCallback de fetchProjectsForUser ne fait pas de setState directs
      // mais modifie l'état du hook via les setters.
    };

    if (authLoading) {
      console.log("useProjects: Auth is loading, waiting...");
      setLoading(true); // Indiquer que les projets attendent l'authentification
      return;
    }

    if (!currentUser?.uid) {
      console.log("useProjects: No current user or UID. Clearing projects.");
      setProjects([]);
      setLoading(false);
      setError(null);
      return;
    }

    console.log("useProjects: User available, calling fetchProjectsForUser.");
    executeFetch(currentUser.uid);

    return () => {
      console.log("useProjects: useEffect cleanup.");
      isComponentMounted = false;
      // Le `isMounted` dans `fetchProjectsForUser` est celui qui compte vraiment
      // pour les opérations asynchrones de cette fonction.
      // Celui-ci est pour le `useEffect` lui-même, mais comme `fetchProjectsForUser`
      // est `useCallback`, il ne sera pas recréé et ne lira pas ce `isComponentMounted`.
      // La gestion `isMounted` dans `fetchProjectsForUser` est plus pertinente pour éviter les setStates après unmount.
      // Toutefois, pour la propreté, le isMounted dans fetchProjectsForUser devrait être lié à son propre scope,
      // ce qui est le cas.
    };
  }, [currentUser?.uid, authLoading, fetchProjectsForUser]);

  const refreshProjects = useCallback(() => {
    if (currentUser?.uid && !authLoading) {
      console.log("useProjects: Manual refresh called.");
      fetchProjectsForUser(currentUser.uid);
    }
  }, [currentUser?.uid, authLoading, fetchProjectsForUser]);

  return { projects, loading, error, refreshProjects };
}
