<<<<<<< HEAD
<<<<<<< HEAD
// src/components/auth/LoginForm.tsx
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
import { useAuth } from "@/contexts/AuthContext"; // Ajouté
=======
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
<<<<<<< HEAD
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
import { notify } from "@/lib/notify";
import { authService } from "@/services/AuthService";
import { AuthProviderType } from "@/types/enums/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
<<<<<<< HEAD
<<<<<<< HEAD
import Image from "next/image";
import { useRouter } from "next/navigation";
=======
import { motion } from "framer-motion";
import Image from "next/image";
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
import { motion } from "framer-motion";
import Image from "next/image";
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
<<<<<<< HEAD
<<<<<<< HEAD
  email: z.string().email("L'adresse email est invalide."),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});
type LoginFormData = z.infer<typeof loginSchema>;

const getFirebaseErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "L'adresse e-mail ou le mot de passe est incorrect.";
    case "auth/invalid-email":
      return "L'adresse e-mail n'est pas valide.";
    case "auth/user-disabled":
      return "Ce compte utilisateur a été désactivé.";
    case "auth/network-request-failed":
      return "Erreur de connexion réseau. Veuillez vérifier votre connexion Internet.";
    case "auth/too-many-requests":
      return "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
    default:
      console.error("Firebase Auth Error (non géré spécifiquement):", error);
      return "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
  }
};

interface LoginFormProps {
  onSwitchToSignup?: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [error, setError] = useState<string>("");
=======
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});
type LoginFormData = z.infer<typeof loginSchema>;

const firebaseMessage = (err: FirebaseError) => {
  const map: Record<string, string> = {
    "auth/user-not-found": "Utilisateur introuvable",
    "auth/wrong-password": "Mot de passe incorrect",
    "auth/invalid-credential": "Identifiants invalides",
    "auth/invalid-email": "Adresse e-mail invalide",
    "auth/user-disabled": "Compte désactivé",
    "auth/network-request-failed": "Problème réseau",
    "auth/too-many-requests": "Trop de tentatives, réessayez",
  };
  return map[err.code] ?? "Erreur inconnue";
};

interface Props {
  onSwitchToSignup?: () => void;
}

export default function LoginForm({ onSwitchToSignup }: Props) {
  const [error, setError] = useState("");
<<<<<<< HEAD
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
<<<<<<< HEAD
<<<<<<< HEAD
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const router = useRouter();
  const { setSessionDetails } = useAuth(); // pour forcer la MAJ du contexte

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      // Récupère la session renvoyée par le service
=======
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const { setSessionDetails } = useAuth();

  /* ----- submit ----- */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
<<<<<<< HEAD
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
      const { appUser, session } = await authService.signInUser(
        data.email,
        data.password
      );
<<<<<<< HEAD
<<<<<<< HEAD
      setSessionDetails(appUser, session); // SYNCHRONISE le contexte
      notify.success("Connexion réussie ! Redirection...");
      // Redirection après la synchronisation
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getFirebaseErrorMessage(err));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue lors de la connexion.");
      }
      console.error("Login error:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      // Récupère la session renvoyée par le service
      const { appUser, session } = await authService.signInWithProvider(
        AuthProviderType.GOOGLE
      );
      setSessionDetails(appUser, session); // SYNCHRONISE le contexte
      notify.success("Connexion avec Google réussie ! Redirection...");
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (
          err.code === "auth/popup-closed-by-user" ||
          err.code === "auth/cancelled-popup-request"
        ) {
          // Optionnel: pas d'erreur affichée si popup annulée
        } else {
          setError(getFirebaseErrorMessage(err));
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la connexion avec Google.");
      }
      console.error("Google sign-in error:", err);
    }
  };

  const GoogleIcon = () => (
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
            src="/images/AlertFireLogo_CARRE.png"
            alt="Logo alertfire"
            width={80}
            height={80}
            priority
          />
        </div>
        <CardTitle className="text-center text-2xl font-bold dark:text-white">
          Bonjour !
        </CardTitle>
        <CardDescription className="text-center dark:text-gray-400">
          Connectez-vous à votre compte AlertFire
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="Votre mot de passe"
            {...register("password")}
            error={errors.password?.message}
            disabled={isSubmitting}
          />
          {error && (
            <p role="alert" className="text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Ou continuer avec
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
          {onSwitchToSignup && (
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Pas encore de compte ?{" "}
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                onClick={onSwitchToSignup}
                disabled={isSubmitting}
              >
                S'inscrire
              </button>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
=======
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
      setSessionDetails(appUser, session);
      notify.success("Connexion réussie !");
    } catch (err) {
      const msg =
        err instanceof FirebaseError
          ? firebaseMessage(err)
          : err instanceof Error
          ? err.message
          : "Erreur inconnue";
      setError(msg);
    }
  };

  /* ----- Google signin ----- */
  const signInGoogle = async () => {
    try {
      setError("");
      const { appUser, session } = await authService.signInWithProvider(
        AuthProviderType.GOOGLE
      );
      setSessionDetails(appUser, session);
      notify.success("Connecté avec Google !");
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (
          [
            "auth/popup-closed-by-user",
            "auth/cancelled-popup-request",
          ].includes(err.code)
        )
          return; // annulation => silencieux
        setError(firebaseMessage(err));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg dark:bg-gray-800/70"
    >
      {/* Header */}
      <div className="mb-6 text-center space-y-2">
        <Image
          src="/images/AlertFire.png"
          alt="Logo AlertFire"
          width={120}
          height={120}
          priority
          className="mx-auto select-none"
        />
        <h2 className="text-2xl font-bold">Bienvenue&nbsp;!</h2>
        <p className="text-sm text-muted-foreground">
          Connectez-vous à votre espace
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Adresse e-mail"
          placeholder="vous@exemple.com"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          disabled={isSubmitting}
        />
        <Input
          label="Mot de passe"
          placeholder="••••••••"
          type="password"
          {...register("password")}
          error={errors.password?.message}
          disabled={isSubmitting}
        />

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          variant="primary"
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <span className="flex-grow border-t border-border" />
        <span className="mx-3 text-xs text-muted-foreground">ou</span>
        <span className="flex-grow border-t border-border" />
      </div>

      {/* Google Button */}
      <Button
        variant="secondary"
        className="w-full gap-2"
        onClick={signInGoogle}
        disabled={isSubmitting}
      >
        {/* simple svg icône G  */}
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
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
        </svg>
        Google
      </Button>

      {/* Switch link */}
      {onSwitchToSignup && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte&nbsp;?{" "}
          <Button
            variant="link"
            size="sm"
            onClick={onSwitchToSignup}
            disabled={isSubmitting}
          >
            S’inscrire
          </Button>
        </p>
      )}
    </motion.div>
<<<<<<< HEAD
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
  );
}
