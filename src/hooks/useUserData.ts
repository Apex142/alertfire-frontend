'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
  Timestamp,
  collectionGroup,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirestoreUser, ProjectData, UserDataState } from '@/types/user';
import { create } from 'zustand';

// Fonction utilitaire pour convertir les timestamps
function convertTimestamp(timestamp: any): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
}

// Store pour le cache des données
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
  reset: () => set({
    loading: true,
    error: null,
    user: null,
    userData: null,
    projects: []
  })
}));

// Fonction pour créer un utilisateur Firestore à partir de Firebase Auth
async function createFirestoreUser(firebaseUser: FirebaseUser): Promise<FirestoreUser> {
  console.log('📝 useUserData: Création du document utilisateur Firestore', { uid: firebaseUser.uid });

  const newUserData: FirestoreUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || 'Nouvel utilisateur',
    photoURL: firebaseUser.photoURL || undefined,
    role: 'user',
    onboardingCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    companies: [],
    preferences: {
      theme: 'light',
      language: 'fr',
      notifications: true
    }
  };

  return newUserData;
}

// Fonction pour charger les données utilisateur
async function loadUserData(firebaseUser: FirebaseUser): Promise<FirestoreUser> {

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log('⚠️ useUserData: Document utilisateur non trouvé, création en cours...');
    const newUserData = await createFirestoreUser(firebaseUser);
    return newUserData;
  }

  const userData = userSnap.data() as DocumentData;

  // Log des données brutes
  console.log('📋 useUserData: Données brutes Firestore', {
    uid: firebaseUser.uid,
    rawData: userData,
    authData: {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      isAnonymous: firebaseUser.isAnonymous,
      metadata: firebaseUser.metadata
    }
  });

  // Conversion des timestamps en Date
  const formattedUserData: FirestoreUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || userData.email,
    displayName: firebaseUser.displayName || userData.displayName || 'Utilisateur',
    photoURL: firebaseUser.photoURL || userData.photoURL,
    role: userData.role || 'user',
    onboardingCompleted: userData.onboardingCompleted || false,
    createdAt: convertTimestamp(userData.createdAt),
    updatedAt: convertTimestamp(userData.updatedAt),
    companies: userData.companies || [],
    preferences: userData.preferences || {
      theme: 'light',
      language: 'fr',
      notifications: true
    },
    companySelected: userData.companySelected,
    firstName: userData.firstName,
    lastName: userData.lastName,
    fullAddress: userData.fullAddress,
    intent: userData.intent,
    lastLogin: userData.lastLogin ? convertTimestamp(userData.lastLogin) : undefined,
    legalStatus: userData.legalStatus,
    phone: userData.phone,
    position: userData.position,
    onboardingStep: userData.onboardingStep,
  };

  return formattedUserData;
}

// Fonction pour charger les projets en temps réel
// Pour éviter les surcharges prévoir d'enregistrer les data du projet dans project_memberships

function listenToProjects(uid: string, setProjects: (projects: ProjectData[]) => void) {
  // 1. Écoute les project_memberships de l'utilisateur
  const membershipsQuery = query(
    collection(db, 'project_memberships'),
    where('userId', '==', uid)
  );
  return onSnapshot(membershipsQuery, async (membershipsSnapshot) => {
    const projectIds = membershipsSnapshot.docs.map(doc => doc.data().projectId).filter(Boolean);
    if (projectIds.length === 0) {
      setProjects([]);
      return;
    }
    // 2. Charge les projets correspondants (batch par 10 pour Firestore)
    const batchSize = 10;
    let allProjects: ProjectData[] = [];
    for (let i = 0; i < projectIds.length; i += batchSize) {
      const batchIds = projectIds.slice(i, i + batchSize);
      const projectsQuery = query(
        collection(db, 'projects'),
        where('__name__', 'in', batchIds)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const batchProjects = projectsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          status: data.status || 'draft',
          startDate: convertTimestamp(data.startDate),
          endDate: data.endDate ? convertTimestamp(data.endDate) : undefined,
          members: data.members || [],
          companyId: data.companyId || '',
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          createdBy: data.createdBy || '',
          color: data.color || '#3F51B5', // couleur par défaut
          projectName: data.projectName || '',
        } as ProjectData & { color?: string; displayName?: string };
      });
      allProjects = allProjects.concat(batchProjects);
    }
    setProjects(allProjects);
  });
}

// Fonction pour charger les companies via company_memberships
async function loadUserCompaniesFromMemberships(userId: string) {
  const membershipsQuery = query(
    collection(db, 'company_memberships'),
    where('userId', '==', userId),
    where('status', '==', 'approved')
  );
  const membershipsSnap = await getDocs(membershipsQuery);
  const companies: any[] = [];
  for (const docSnap of membershipsSnap.docs) {
    const { companyId } = docSnap.data();
    if (companyId) {
      const companySnap = await getDoc(doc(db, 'companies', companyId));
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
  const {
    loading,
    error,
    user,
    userData,
    projects,
    setUserData
  } = useUserStore();

  const [userCompanies, setUserCompanies] = useState<any[]>([]);
  const [unsubscribeProjects, setUnsubscribeProjects] = useState<(() => void) | null>(null);

  useEffect(() => {
    setMounted(true);
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          console.log('⚠️ useUserData: Utilisateur non authentifié');
          setUserData({
            loading: false,
            user: null,
            userData: null,
            projects: []
          });
          return;
        }

        // Chargement des données utilisateur
        const userData = await loadUserData(firebaseUser);

        // Chargement des projets en temps réel si nécessaire
        if (!skipProjects) {
          if (unsubscribeProjects) unsubscribeProjects();
          const unsub = listenToProjects(firebaseUser.uid, (projects) => {
            setUserData({ projects });
          });
          setUnsubscribeProjects(() => unsub);
        }

        // Chargement des companies via company_memberships
        const companies = await loadUserCompaniesFromMemberships(firebaseUser.uid);
        setUserCompanies(companies);

        setUserData({
          loading: false,
          user: firebaseUser,
          userData,
          error: null
        });

        console.log('✅ useUserData: Données mises à jour dans le store');

      } catch (err) {
        console.error('❌ useUserData: Erreur lors du chargement des données:', err);
        setUserData({
          loading: false,
          error: err instanceof Error ? err : new Error('Erreur inconnue'),
          user: null,
          userData: null,
          projects: []
        });
      }
    });

    return () => {
      if (unsubscribeProjects) unsubscribeProjects();
      console.log('🧹 useUserData: Nettoyage du hook');
      unsubscribe();
      setMounted(false);
    };
  }, [router, setUserData, skipProjects]);

  // Log des changements d'état
  useEffect(() => {
    if (!mounted) return;

    console.log('📊 useUserData: État actuel', {
      loading,
      hasError: !!error,
      hasUser: !!user,
      hasUserData: !!userData,
      projectsCount: projects.length,
      companiesCount: userCompanies.length
    });
  }, [mounted, loading, error, user, userData, projects, userCompanies]);

  return {
    loading: mounted ? loading : true,
    error,
    user,
    userData,
    projects,
    userCompanies
  };
} 