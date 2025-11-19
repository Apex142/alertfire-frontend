"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import { useAuthService } from "@/hooks/useAuthService";
import { AuthProviderType } from "@/types/enums/AuthProvider";

/* -------------------- Schéma Zod -------------------- */
const signupSchema = z
  .object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Min. 6 caractères"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

type SignupFormData = z.infer<typeof signupSchema>;

const firebaseMessage = (err: FirebaseError | unknown) =>
  err instanceof FirebaseError && err.code === "auth/email-already-in-use"
    ? "Email déjà utilisé"
    : "Erreur d'inscription. Réessayez.";

interface Props {
  onSwitchToLogin?: () => void;
}

/* -------------------- Composant principal -------------------- */
export default function SignupForm({ onSwitchToLogin }: Props) {
  const { setSessionDetails } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const { authService, loading: authServiceLoading } = useAuthService();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const isBusy = useMemo(
    () => isSubmitting || authServiceLoading || !authService,
    [authService, authServiceLoading, isSubmitting]
  );

  const onSubmit = useCallback(
    async (data: SignupFormData) => {
      if (!authService) return;
      setSubmitError("");
      try {
        const { appUser, session } = await authService.signUpUser(
          data.email,
          data.password
        );
        if (appUser && session) {
          setSessionDetails(appUser, session);
          notify.success("Inscription réussie !");
        }
      } catch (e) {
        setSubmitError(firebaseMessage(e));
      }
    },
    [authService, setSessionDetails]
  );

  const signInGoogle = useCallback(async () => {
    if (!authService) return;
    try {
      setSubmitError("");

      const { appUser, session } = await authService.signInWithProvider(
        AuthProviderType.GOOGLE
      );
      if (appUser && session) {
        setSessionDetails(appUser, session);
        notify.success("Connecté avec Google !");
      }
    } catch (e) {
      setSubmitError(firebaseMessage(e));
    }
  }, [authService, setSessionDetails]);

  return (
    <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg transition-transform duration-200 ease-out will-change-transform dark:bg-gray-800/70">
      <div className="mb-6 text-center space-y-2">
        <Image
          src="/images/AlertFire.png"
          alt="Logo AlertFire"
          width={120}
          height={120}
          priority
          className="mx-auto select-none"
        />
        <h2 className="text-2xl font-bold">Créer un compte</h2>
        <p className="text-sm text-muted-foreground">
          Rejoignez AlertFire dès aujourd’hui
        </p>
      </div>

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
        <Input
          label="Confirmer le mot de passe"
          placeholder="••••••••"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
        />

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isBusy}>
          {isBusy ? "Inscription..." : "S’inscrire"}
        </Button>
      </form>

      <div className="my-6 flex items-center">
        <span className="flex-grow border-t border-border" />
        <span className="mx-3 text-xs text-muted-foreground">ou</span>
        <span className="flex-grow border-t border-border" />
      </div>

      <Button
        variant="secondary"
        className="w-full gap-2"
        onClick={signInGoogle}
        disabled={isBusy}
      >
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

      {onSwitchToLogin && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà un compte&nbsp;?{" "}
          <Button
            variant="primary"
            size="sm"
            onClick={onSwitchToLogin}
            disabled={isBusy}
          >
            Se connecter
          </Button>
        </p>
      )}
    </div>
  );
}
