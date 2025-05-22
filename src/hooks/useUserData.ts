"use client";

import { db } from "@/lib/firebase";
import { FirestoreUser, ProjectData, UserDataState } from "@/types/user";
import {
  User as FirebaseUser,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  DocumentData,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { create } from "zustand";

function convertTimestamp(timestamp: any): Date {
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === "string") return new Date(timestamp);
  return new Date();
}

interface UserStore extends UserDataState {
  setUserData: (data: Partial<UserDataState>) => void;
  reset: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  loading: true,
  error: null,
  user: null,
  userData: null,
  projects: [],
  setUserData: (data) => set((state) => ({ ...state, ...data })),
  reset: () =>
    set({
      loading: true,
      error: null,
      user: null,
      userData: null,
      projects: [],
    }),
}));

async function createFirestoreUser(
  firebaseUser: FirebaseUser
): Promise<FirestoreUser> {
  console.log("📝 useUserData: Création du document utilisateur Firestore", {
    uid: firebaseUser.uid,
  });
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "Nouvel utilisateur",
    photoURL: firebaseUser.photoURL || undefined,
    role: "user",
    onboardingCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    companies: [],
    preferences: { theme: "light", language: "fr", notifications: true },
  };
}

async function loadUserData(
  firebaseUser: FirebaseUser
): Promise<FirestoreUser> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log(
      "⚠️ useUserData: Document utilisateur non trouvé, création en cours..."
    );
    return await createFirestoreUser(firebaseUser);
  }

  const userData = userSnap.data() as DocumentData;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || userData.email,
    displayName:
      firebaseUser.displayName || userData.displayName || "Utilisateur",
    photoURL: firebaseUser.photoURL || userData.photoURL,
    role: userData.role || "user",
    onboardingCompleted: userData.onboardingCompleted || false,
    createdAt: convertTimestamp(userData.createdAt),
    updatedAt: convertTimestamp(userData.updatedAt),
    companies: userData.companies || [],
    preferences: userData.preferences || {
      theme: "light",
      language: "fr",
      notifications: true,
    },
    companySelected: userData.companySelected,
    firstName: userData.firstName,
    lastName: userData.lastName,
    fullAddress: userData.fullAddress,
    intent: userData.intent,
    lastLogin: userData.lastLogin
      ? convertTimestamp(userData.lastLogin)
      : undefined,
    legalStatus: userData.legalStatus,
    phone: userData.phone,
    position: userData.position,
    onboardingStep: userData.onboardingStep,
  };
}

function listenToProjects(
  uid: string,
  setProjects: (projects: ProjectData[]) => void
) {
  const membershipsQuery = query(
    collection(db, "project_memberships"),
    where("userId", "==", uid),
    where("status", "==", "approved")
  );

  return onSnapshot(membershipsQuery, async (membershipsSnapshot) => {
    const projectIds = membershipsSnapshot.docs
      .map((doc) => doc.data().projectId)
      .filter(Boolean);

    if (projectIds.length === 0) {
      setProjects([]);
      return;
    }

    const batchSize = 10;
    let allProjects: ProjectData[] = [];

    for (let i = 0; i < projectIds.length; i += batchSize) {
      const batchIds = projectIds.slice(i, i + batchSize);
      const projectsQuery = query(
        collection(db, "projects"),
        where("__name__", "in", batchIds)
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      const batchProjects = projectsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          status: data.status || "draft",
          startDate: convertTimestamp(data.startDate),
          endDate: data.endDate ? convertTimestamp(data.endDate) : undefined,
          members: data.members || [],
          companyId: data.companyId || "",
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          createdBy: data.createdBy || "",
          color: data.color || "#3F51B5",
          projectName: data.projectName || "",
        } as ProjectData;
      });

      allProjects = allProjects.concat(batchProjects);
    }

    console.log("✅ projects approuvés trouvés :", allProjects);
    setProjects(allProjects);
  });
}

async function loadUserCompaniesFromMemberships(userId: string) {
  const membershipsQuery = query(
    collection(db, "company_memberships"),
    where("userId", "==", userId),
    where("status", "==", "approved")
  );
  const membershipsSnap = await getDocs(membershipsQuery);
  const companies: any[] = [];
  for (const docSnap of membershipsSnap.docs) {
    const { companyId } = docSnap.data();
    if (companyId) {
      const companySnap = await getDoc(doc(db, "companies", companyId));
      if (companySnap.exists()) {
        companies.push({ id: companyId, ...companySnap.data() });
      }
    }
  }
  return companies;
}

export function useUserData(skipProjects = false) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { loading, error, user, userData, projects, setUserData } =
    useUserStore();
  const [userCompanies, setUserCompanies] = useState<any[]>([]);
  const [unsubscribeProjects, setUnsubscribeProjects] = useState<
    (() => void) | null
  >(null);

  useEffect(() => {
    setMounted(true);
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          console.log("⚠️ useUserData: Utilisateur non authentifié");
          setUserData({
            loading: false,
            user: null,
            userData: null,
            projects: [],
          });
          return;
        }

        const userData = await loadUserData(firebaseUser);

        if (!skipProjects) {
          if (unsubscribeProjects) unsubscribeProjects();
          const unsub = listenToProjects(firebaseUser.uid, (projects) => {
            setUserData({ projects });
          });
          setUnsubscribeProjects(() => unsub);
        }

        const companies = await loadUserCompaniesFromMemberships(
          firebaseUser.uid
        );
        setUserCompanies(companies);

        setUserData({
          loading: false,
          user: firebaseUser,
          userData,
          error: null,
        });
        console.log("✅ useUserData: Données mises à jour dans le store");
      } catch (err) {
        console.error(
          "❌ useUserData: Erreur lors du chargement des données:",
          err
        );
        setUserData({
          loading: false,
          error: err instanceof Error ? err : new Error("Erreur inconnue"),
          user: null,
          userData: null,
          projects: [],
        });
      }
    });

    return () => {
      if (unsubscribeProjects) unsubscribeProjects();
      console.log("🧹 useUserData: Nettoyage du hook");
      unsubscribe();
      setMounted(false);
    };
  }, [router, setUserData, skipProjects]);

  useEffect(() => {
    if (!mounted) return;
    console.log("📊 useUserData: État actuel", {
      loading,
      hasError: !!error,
      hasUser: !!user,
      hasUserData: !!userData,
      projectsCount: projects.length,
      companiesCount: userCompanies.length,
    });
  }, [mounted, loading, error, user, userData, projects, userCompanies]);

  return {
    loading: mounted ? loading : true,
    error,
    user,
    userData,
    projects,
    userCompanies,
  };
}
