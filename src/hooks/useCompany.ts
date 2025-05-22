import { db } from "@/lib/firebase";
import { Company } from "@/types/company";
import {
  collection,
  FirestoreDataConverter,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

// -- Converter amélioré (voir message précédent) --
const defaultSettings = {
  defaultCurrency: "EUR",
  language: "fr",
};

export const companyConverter: FirestoreDataConverter<Company> = {
  toFirestore: (company: Company) => ({
    name: company.name,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
    createdBy: company.createdBy,
    members: company.members ?? [],
    settings: company.settings ?? defaultSettings,
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name ?? "",
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt ?? null,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : data.updatedAt ?? null,
      createdBy: data.createdBy ?? "",
      members: Array.isArray(data.members) ? data.members : [],
      settings: {
        ...defaultSettings,
        ...(data.settings ?? {}),
      },
    } as Company;
  },
};

// --- Typage projet ---
export interface Project {
  id: string;
  name: string;
  companyId: string;
  // ajoute d'autres champs si besoin
}

export interface UseCompanyOptions {
  realtime?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

export function useCompany(
  companyId: string | undefined,
  options: UseCompanyOptions = {}
) {
  const [company, setCompany] = useState<Company | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setCompany(null);
      setProjects([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // -- Fetch société --
    import("firebase/firestore").then(({ doc, getDoc }) => {
      const ref = doc(db, "companies", companyId).withConverter(
        companyConverter
      );
      getDoc(ref)
        .then((snap) => {
          setCompany(snap.exists() ? snap.data()! : null);
        })
        .catch((err) => setError(err.message));
    });

    // -- Fetch projets de la société --
    (async () => {
      try {
        const q = query(
          collection(db, "projects"),
          where("companyId", "==", companyId)
        );
        const snapshot = await getDocs(q);
        const projectsData: Project[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          companyId: doc.data().companyId,
        }));
        setProjects(projectsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des projets."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [companyId]);

  return { company, projects, loading, error };
}
