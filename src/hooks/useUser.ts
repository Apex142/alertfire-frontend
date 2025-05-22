import { db } from "@/lib/firebase";
import { FirestoreUser } from "@/types/user";
import {
  collection,
  DocumentData,
  FirestoreDataConverter,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreDoc } from "./useFirestoreDoc";

// --- Converter robuste (tu peux l'importer ailleurs) ---
export const userConverter: FirestoreDataConverter<FirestoreUser> = {
  toFirestore: (user: FirestoreUser): DocumentData => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? "",
    photoURL: user.photoURL ?? "",
    role: user.role ?? "user",
    onboardingCompleted: user.onboardingCompleted ?? false,
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date(),
    companies: user.companies ?? [],
    preferences: user.preferences ?? {
      theme: "light",
      language: "fr",
      notifications: true,
    },
    companySelected: user.companySelected ?? null,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    fullAddress: user.fullAddress ?? "",
    intent: user.intent ?? "",
    lastLogin: user.lastLogin ?? null,
    legalStatus: user.legalStatus ?? "",
    phone: user.phone ?? "",
    position: user.position ?? "",
    onboardingStep: user.onboardingStep ?? 0,
    favoriteLocationIds: user.favoriteLocationIds ?? [],
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options) || {};
    const convertDate = (d: any): Date | null =>
      !d
        ? null
        : d instanceof Timestamp
        ? d.toDate()
        : typeof d === "string"
        ? new Date(d)
        : d;
    return {
      uid: data.uid ?? snapshot.id,
      email: data.email ?? "",
      displayName: data.displayName ?? "",
      photoURL: data.photoURL ?? "",
      role: data.role ?? "user",
      onboardingCompleted: data.onboardingCompleted ?? false,
      createdAt: convertDate(data.createdAt) ?? null,
      updatedAt: convertDate(data.updatedAt) ?? null,
      companies: Array.isArray(data.companies) ? data.companies : [],
      preferences: {
        theme: data.preferences?.theme ?? "light",
        language: data.preferences?.language ?? "fr",
        notifications: data.preferences?.notifications ?? true,
      },
      companySelected: data.companySelected ?? null,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      fullAddress: data.fullAddress ?? "",
      intent: data.intent ?? "",
      lastLogin: convertDate(data.lastLogin) ?? null,
      legalStatus: data.legalStatus ?? "",
      phone: data.phone ?? "",
      position: data.position ?? "",
      onboardingStep: data.onboardingStep ?? 0,
      favoriteLocationIds: Array.isArray(data.favoriteLocationIds)
        ? data.favoriteLocationIds
        : [],
    } as FirestoreUser;
  },
};

// --- Hook pour 1 utilisateur ---
export interface UseUserOptions {
  realtime?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

export function useUser(userId: string, options: UseUserOptions = {}) {
  return useFirestoreDoc<FirestoreUser>("users", userId, {
    ...options,
    converter: userConverter,
  });
}

// --- Hook pour TOUS les utilisateurs, avec filtre optionnel ---
type UsersFilter = { field: string; value: any } | undefined;

export function useUsers(filter?: UsersFilter) {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let q;
    if (filter) {
      q = query(
        collection(db, "users").withConverter(userConverter),
        where(filter.field, "==", filter.value)
      );
    } else {
      q = query(collection(db, "users").withConverter(userConverter));
    }

    getDocs(q)
      .then((snapshot) => {
        setUsers(snapshot.docs.map((doc) => doc.data()));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter?.field, filter?.value]);

  return { users, loading, error };
}
