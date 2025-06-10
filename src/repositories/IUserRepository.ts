// src/repositories/IUserRepository.ts (Version mise à jour)

import { User } from "@/types/entities/User";

// Type pour les données de création, pour éviter le Omit complexe
export type CreateUserData = Pick<User, "email" | "displayName" | "photoURL"> &
  Partial<Pick<User, "companies" | "companySelected">>;

export interface IUserRepository {
  findById(uid: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  getAll(): Promise<User[]>;
  create(userData: CreateUserData, uid: string): Promise<User>;
  update(
    uid: string,
    data: Partial<Omit<User, "uid" | "createdAt">>
  ): Promise<User | null>;
  delete(uid: string): Promise<void>;
}
