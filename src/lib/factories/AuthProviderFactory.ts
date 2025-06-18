"use client";

// src/lib/factories/AuthProviderFactory.ts
import { AuthProviderType } from "@/types/enums/AuthProvider";
import {
  AuthProvider,
  EmailAuthProvider, // Principalement pour la liaison de compte ou ré-authentification.
  GoogleAuthProvider,
} from "firebase/auth";

export interface IAuthProviderStrategy {
  getProvider(): AuthProvider;
}

class GoogleAuthStrategy implements IAuthProviderStrategy {
  private provider: GoogleAuthProvider;

  constructor() {
    this.provider = new GoogleAuthProvider();
    this.provider.addScope("profile");
    this.provider.addScope("email");
    // Options supplémentaires:
    // this.provider.setCustomParameters({ prompt: 'select_account' });
  }

  public getProvider(): AuthProvider {
    return this.provider;
  }
}

class EmailAuthStrategy implements IAuthProviderStrategy {
  private provider: EmailAuthProvider;

  constructor() {
    // EmailAuthProvider est utilisé différemment des fournisseurs OAuth.
    // Il n'est pas passé à signInWithPopup/Redirect.
    // Son inclusion ici est pour la complétude du pattern si jamais nécessaire
    // pour des flux spécifiques (ex: vérifier si un email est déjà lié à un fournisseur).
    this.provider = new EmailAuthProvider();
  }

  public getProvider(): AuthProvider {
    return this.provider;
  }
}

export class AuthProviderFactory {
  static create(type: AuthProviderType): IAuthProviderStrategy {
    switch (type) {
      case AuthProviderType.GOOGLE:
        return new GoogleAuthStrategy();
      case AuthProviderType.EMAIL:
        // Bien que la stratégie existe, son utilisation pour signIn est gérée différemment par AuthService.
        return new EmailAuthStrategy();
      default:
        console.error(`Unsupported auth provider type: ${type}`);
        throw new Error(`Unsupported auth provider type: ${type}`);
    }
  }
}
