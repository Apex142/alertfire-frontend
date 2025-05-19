import { FirestoreDataConverter, Timestamp } from 'firebase/firestore';
import { useFirestoreDoc } from './useFirestoreDoc';
import { FirestoreUser } from '@/types/user';

const userConverter: FirestoreDataConverter<FirestoreUser> = {
  toFirestore: (user: FirestoreUser) => {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      companies: user.companies,
      preferences: user.preferences,
      companySelected: user.companySelected,
      firstName: user.firstName,
      lastName: user.lastName,
      fullAddress: user.fullAddress,
      intent: user.intent,
      lastLogin: user.lastLogin,
      legalStatus: user.legalStatus,
      phone: user.phone,
      position: user.position,
      onboardingStep: user.onboardingStep,
      favoriteLocationIds: user.favoriteLocationIds,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      role: data.role || 'user',
      onboardingCompleted: data.onboardingCompleted || false,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      companies: data.companies || [],
      preferences: data.preferences || {
        theme: 'light',
        language: 'fr',
        notifications: true,
      },
      companySelected: data.companySelected,
      firstName: data.firstName,
      lastName: data.lastName,
      fullAddress: data.fullAddress,
      intent: data.intent,
      lastLogin: data.lastLogin ? (data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : new Date(data.lastLogin)) : undefined,
      legalStatus: data.legalStatus,
      phone: data.phone,
      position: data.position,
      onboardingStep: data.onboardingStep,
      favoriteLocationIds: data.favoriteLocationIds || [],
    } as FirestoreUser;
  },
};

interface UseUserOptions {
  realtime?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

export function useUser(userId: string, options: UseUserOptions = {}) {
  return useFirestoreDoc<FirestoreUser>('users', userId, {
    ...options,
    converter: userConverter,
  });
} 