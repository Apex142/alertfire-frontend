// src/components/auth/SignupForm.tsx
"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext"; // Pour setSessionDetails
import { notify } from "@/lib/notify"; // Assurez-vous que ce chemin est correct
import { authService } from "@/services/AuthService"; // Utiliser notre instance de AuthService
import { AuthProviderType } from "@/types/enums/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schéma Zod pour l'inscription
// Pour l'instant, nous ne collectons que email et mot de passe.
// Si vous voulez collecter firstName, lastName, etc., ajoutez-les ici.
const signupSchema = z
  .object({
    // firstName: z.string().min(1, "Le prénom est requis."), // Exemple si vous ajoutez des champs
    // lastName: z.string().min(1, "Le nom est requis."),   // Exemple
    email: z.string().email("L'adresse email est invalide."),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"], // Erreur associée au champ confirmPassword
  });

type SignupFormData = z.infer<typeof signupSchema>;

// Fonction pour traduire les erreurs Firebase en messages utilisateurs
const getFirebaseErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.";
    case "auth/invalid-email":
      return "L'adresse email n'est pas valide.";
    case "auth/operation-not-allowed":
      return "La création de compte par email/mot de passe est temporairement désactivée.";
    case "auth/weak-password":
      return "Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.";
    case "auth/network-request-failed":
      return "Erreur de connexion réseau. Veuillez vérifier votre connexion Internet.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Veuillez réessayer plus tard.";
    default:
      console.error("Firebase Auth Error (Signup):", error);
      return "Une erreur est survenue lors de la création du compte. Veuillez réessayer.";
  }
};

interface SignupFormProps {
  onSwitchToLogin?: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { setSessionDetails } = useAuth(); // Obtenir setSessionDetails du contexte
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError("");
      // Préparer les données additionnelles si votre formulaire les collecte (ex: nom, prénom)
      // const additionalData = {
      //   firstName: data.firstName,
      //   lastName: data.lastName,
      // };
      // Pour l'instant, nous n'avons que email/password dans le formulaire Zod.
      // AuthService.signUpUser peut prendre un objet `additionalData` pour pré-remplir le profil Firestore.
      const authResult = await authService.signUpUser(
        data.email,
        data.password /*, additionalData */
      );

      if (authResult.appUser && authResult.session) {
        setSessionDetails(authResult.appUser, authResult.session);
      } else {
        // Cela ne devrait pas arriver si signUpUser est bien implémenté pour retourner appUser et session
        console.warn("SignupForm: appUser or session is null after signup.");
      }
      notify.success("Inscription réussie ! Redirection...");
      // La redirection sera gérée par la page parente (ex: HomePage) qui écoute l'état d'authentification
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getFirebaseErrorMessage(err));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue lors de l'inscription.");
      }
      console.error("Signup error:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      const authResult = await authService.signInWithProvider(
        AuthProviderType.GOOGLE
      );

      if (authResult.appUser && authResult.session) {
        setSessionDetails(authResult.appUser, authResult.session);
      } else {
        console.warn(
          "SignupForm: appUser or session is null after Google sign-in."
        );
      }
      notify.success("Inscription avec Google réussie ! Redirection...");
      // La redirection est gérée par la page parente
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (
          err.code === "auth/popup-closed-by-user" ||
          err.code === "auth/cancelled-popup-request"
        ) {
          // Optionnel: ne pas afficher d'erreur ou un message discret si l'utilisateur annule.
        } else {
          setError(getFirebaseErrorMessage(err));
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'inscription avec Google.");
      }
      console.error("Google sign-in error (Signup):", err);
    }
  };

  const GoogleIcon = () => (
    /* ... (SVG Google comme défini précédemment) ... */
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );

  return (
    <Card className="w-full max-w-md dark:bg-gray-800">
      <CardHeader>
        <div className="mb-4 flex justify-center">
          <Image
            src="/images/AlertFireLogo_CARRE.png" // Assurez-vous que cette image est dans public/images/
            alt="Logo AlertFire"
            width={80}
            height={80}
            priority
          />
        </div>
        <CardTitle className="text-center text-2xl font-bold dark:text-white">
          Créer votre compte
        </CardTitle>
        <CardDescription className="text-center dark:text-gray-400">
          Rejoignez AlertFire dès aujourd'hui.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Si vous ajoutez des champs comme prénom/nom, mettez-les ici */}
          {/* <Input label="Prénom" {...register("firstName")} error={errors.firstName?.message} disabled={isSubmitting} /> */}
          {/* <Input label="Nom" {...register("lastName")} error={errors.lastName?.message} disabled={isSubmitting} /> */}
          <Input
            type="email"
            label="Adresse e-mail"
            placeholder="vous@exemple.com"
            {...register("email")}
            error={errors.email?.message}
            disabled={isSubmitting}
          />
          <Input
            type="password"
            label="Mot de passe"
            placeholder="Au moins 6 caractères"
            {...register("password")}
            error={errors.password?.message}
            disabled={isSubmitting}
          />
          <Input
            type="password"
            label="Confirmer le mot de passe"
            placeholder="Retapez votre mot de passe"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
          />
          {error && (
            <div
              role="alert"
              className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Ou s'inscrire avec
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <GoogleIcon />
            Google
          </Button>
          {onSwitchToLogin && (
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Déjà un compte ?{" "}
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                onClick={onSwitchToLogin}
                disabled={isSubmitting}
              >
                Se connecter
              </button>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
