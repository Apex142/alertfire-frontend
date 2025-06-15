"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import { authService } from "@/services/AuthService";
import { AuthProviderType } from "@/types/enums/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const { setSessionDetails } = useAuth();

  /* ----- submit ----- */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      const { appUser, session } = await authService.signInUser(
        data.email,
        data.password
      );
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
  );
}
