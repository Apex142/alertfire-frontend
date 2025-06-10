// src/services/UserService.ts
import { IUserRepository } from "@/repositories/IUserRepository";
import { UserRepository } from "@/repositories/UserRepository";
import { User } from "@/types/entities/User"; // Ajustement
import { Timestamp } from "firebase/firestore";

export class UserService {
  private userRepository: IUserRepository; // Dépendance injectée
  // L'injection de dépendance se fait ici.
  // Dans une app plus grande, un conteneur DI peut être utilisé.
  constructor() {
    this.userRepository = new UserRepository(); // Remplacer par l'implémentation concrète
  }

  async getUserProfile(uid: string): Promise<User | null> {
    // ... même logique qu'avant
    return this.userRepository.findById(uid);
  }

  async updateUserProfile(
    uid: string,
    data: Partial<User>
  ): Promise<User | null> {
    const { globalRole, email, ...updatableData } = data;
    if (Object.keys(updatableData).length === 0) {
      throw new Error("Aucune donnée à mettre à jour.");
    }
    return this.userRepository.update(uid, updatableData);
  }

  async getAllUsers(): Promise<User[]> {
    try {
      console.log("UserService: Fetching all users...");
      const users = await this.userRepository.getAll();
      return users;
    } catch (error) {
      console.error("UserService: Error fetching users:", error);
      // Projeter l'erreur pour que la couche supérieure (le hook) puisse la gérer.
      throw error;
    }
  }

  async recordLogin(uid: string): Promise<void> {
    await this.userRepository.update(uid, { lastLogin: Timestamp.now() });
  }
}

export const userService = new UserService();
