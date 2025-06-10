// src/repositories/UserRepository.ts

import { db } from "@/lib/firebase/client";
import { User } from "@/types/entities/User";
import { GlobalRole } from "@/types/enums/GlobalRole";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { CreateUserData, IUserRepository } from "./IUserRepository";

/**
 * ADDED: Fonction utilitaire pour convertir un document Firestore en type User.
 * Centralise la logique de mappage et assure la cohérence des données.
 */
const mapDocToUser = (docSnap: DocumentSnapshot<DocumentData>): User => {
  const data = docSnap.data();
  if (!data) {
    throw new Error(`Aucune donnée pour le document ${docSnap.id}`);
  }
  // On retourne un objet User complet et bien typé
  return {
    uid: docSnap.id,
    email: data.email,
    displayName: data.displayName || null,
    photoURL: data.photoURL || null,
    companies: data.companies || [],
    companySelected: data.companySelected || null,
    globalRole: data.globalRole || GlobalRole.USER,
    onboardingCompleted: data.onboardingCompleted || false,
    onboardingStep: data.onboardingStep || 1,
    preferences: data.preferences || {
      theme: "light",
      language: "fr",
      notifications: true,
    },
    favoriteLocationIds: data.favoriteLocationIds || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastLogin: data.lastLogin,
  } as User;
};

export class UserRepository implements IUserRepository {
  private usersCollection = collection(db, "users");

  // REFACTORED: Utilise mapDocToUser pour la cohérence
  async findById(uid: string): Promise<User | null> {
    const docRef = doc(this.usersCollection, uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? mapDocToUser(docSnap) : null;
  }

  // REFACTORED: Utilise mapDocToUser
  async findByEmail(email: string): Promise<User | null> {
    const q = query(this.usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Un seul utilisateur doit correspondre à un email
      return mapDocToUser(querySnapshot.docs[0]);
    }
    return null;
  }

  // REFACTORED: Signature simplifiée avec le type CreateUserData
  async create(userData: CreateUserData, uid: string): Promise<User> {
    const now = Timestamp.now();

    const newUser: User = {
      uid,
      email: userData.email,
      displayName: userData.displayName || null,
      photoURL: userData.photoURL || null,
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
      onboardingStep: 1,
      onboardingCompleted: false,
      globalRole: GlobalRole.USER, // Rôle par défaut
      companies: userData.companies || [],
      companySelected: userData.companySelected || null,
      preferences: {
        // Préférences par défaut
        theme: "light",
        language: "fr",
        notifications: true,
      },
      favoriteLocationIds: [],
    };

    await setDoc(doc(this.usersCollection, uid), newUser);
    return newUser;
  }

  async update(
    uid: string,
    data: Partial<Omit<User, "uid" | "createdAt">>
  ): Promise<User | null> {
    const userRef = doc(this.usersCollection, uid);
    // Assure que `updatedAt` est bien mis à jour à chaque modification
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
    // Retourne l'utilisateur mis à jour pour confirmation
    return this.findById(uid);
  }

  // REFACTORED: Utilise mapDocToUser et correction du nom de la collection
  async getAll(): Promise<User[]> {
    const querySnapshot = await getDocs(this.usersCollection); // FIX: "usersCollection" était "usersCollectionRef"
    return querySnapshot.docs.map(mapDocToUser);
  }

  async delete(uid: string): Promise<void> {
    await deleteDoc(doc(this.usersCollection, uid));
  }
}
