"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Bell, Lock, Moon, Save, Sun, UserCircle } from "lucide-react";
import { useTheme } from "next-themes";

import { BrandLoader } from "@/components/ui/BrandLoader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthService } from "@/hooks/useAuthService";

const LANG_OPTIONS = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

const THEME_OPTIONS = [
  { value: "light", label: "Clair", icon: <Sun className="h-4 w-4" /> },
  { value: "dark", label: "Sombre", icon: <Moon className="h-4 w-4" /> },
];

type PersonalForm = {
  firstName: string;
  lastName: string;
  phone: string;
  fullAddress: string;
  position: string;
  legalStatus: string;
  intent: string;
};

type PreferencesForm = {
  theme: "light" | "dark";
  language: "fr" | "en";
  notifications: boolean;
};

export default function SettingsPage() {
  const { isAuthenticated, loading } = useRequireAuth();

  if (loading || !isAuthenticated) {
    return <BrandLoader message="Chargement de vos paramètres personnels" />;
  }

  return <SettingsContent />;
}

function SettingsContent() {
  const { appUser, logout } = useAuth();
  const { authService, loading } = useAuthService();
  const { setTheme } = useTheme();

  const [personalForm, setPersonalForm] = useState<PersonalForm>({
    firstName: "",
    lastName: "",
    phone: "",
    fullAddress: "",
    position: "",
    legalStatus: "",
    intent: "",
  });

  const [preferences, setPreferences] = useState<PreferencesForm>({
    theme: "light",
    language: "fr",
    notifications: true,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    if (!appUser) return;
    setPersonalForm({
      firstName: appUser.firstName ?? "",
      lastName: appUser.lastName ?? "",
      phone: appUser.phone ?? "",
      fullAddress: appUser.fullAddress ?? "",
      position: appUser.position ?? "",
      legalStatus: appUser.legalStatus ?? "",
      intent: appUser.intent ?? "",
    });
    setPreferences({
      theme: appUser.preferences?.theme ?? "light",
      language: appUser.preferences?.language ?? "fr",
      notifications: appUser.preferences?.notifications ?? true,
    });
  }, [appUser]);

  const initials = useMemo(() => {
    const letters = [personalForm.firstName, personalForm.lastName]
      .map((value) => (value?.trim?.() ? value.trim()[0].toUpperCase() : ""))
      .join("");
    if (letters.length > 0) return letters;
    if (appUser?.displayName) return appUser.displayName[0]?.toUpperCase() ?? "U";
    return "U";
  }, [appUser?.displayName, personalForm.firstName, personalForm.lastName]);

  if (loading || !authService || !appUser) {
    return <BrandLoader message="Synchronisation des préférences utilisateur" />;
  }

  const handlePersonalChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationsToggle = () => {
    setPreferences((prev) => ({ ...prev, notifications: !prev.notifications }));
  };

  const handleSavePersonal = async () => {
    try {
      setSavingProfile(true);
      await authService.updateUserProfileData(appUser.uid, {
        ...personalForm,
        displayName: `${personalForm.firstName} ${personalForm.lastName}`.trim() || appUser.displayName,
      });
      notify.success("Profil mis à jour");
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer le profil."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSavingPreferences(true);
      await authService.updateUserProfileData(appUser.uid, {
        preferences: {
          theme: preferences.theme,
          language: preferences.language,
          notifications: preferences.notifications,
        },
      });
      setTheme(preferences.theme);
      notify.success("Préférences sauvegardées");
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer les préférences."
      );
    } finally {
      setSavingPreferences(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await authService.sendPasswordReset(appUser.email);
      notify.success(
        "Un email de réinitialisation vient d’être envoyé à votre adresse."
      );
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : "Échec de l’envoi de l’email de réinitialisation."
      );
    }
  };

  const handleSignOutEverywhere = async () => {
    try {
      await authService.signOutAllDevices(appUser.uid);
      await logout("Sign out from settings");
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : "Impossible de déconnecter les sessions."
      );
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Paramètres du compte
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Gérez vos informations personnelles et vos préférences applicatives.
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xl font-semibold text-white shadow-lg">
          {initials}
        </div>
      </header>

      <section className="space-y-8">
        <Card className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/40 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-slate-900/90 p-3 text-white shadow-sm dark:bg-white/90 dark:text-slate-900">
              <UserCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Informations personnelles
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ces champs alimentent la fiche contact partagée avec votre équipe.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Prénom"
              name="firstName"
              value={personalForm.firstName}
              onChange={handlePersonalChange}
            />
            <Input
              label="Nom"
              name="lastName"
              value={personalForm.lastName}
              onChange={handlePersonalChange}
            />
            <Input
              label="Téléphone"
              name="phone"
              value={personalForm.phone}
              onChange={handlePersonalChange}
              placeholder="+33 6 12 34 56 78"
            />
            <Input
              label="Poste / fonction"
              name="position"
              value={personalForm.position}
              onChange={handlePersonalChange}
            />
            <Input
              label="Statut légal"
              name="legalStatus"
              value={personalForm.legalStatus}
              onChange={handlePersonalChange}
              placeholder="Collectivité, entreprise, SDIS…"
              className="md:col-span-2"
            />
          </div>
          <Textarea
            label="Adresse complète"
            name="fullAddress"
            rows={3}
            value={personalForm.fullAddress}
            onChange={handlePersonalChange}
            placeholder="Numéro, rue, code postal, ville"
          />
          <Textarea
            label="Objectif principal"
            name="intent"
            rows={3}
            value={personalForm.intent}
            onChange={handlePersonalChange}
            placeholder="Décrivez en quelques mots votre usage d’AlertFire"
          />
          <div className="flex justify-end">
            <Button
              startIcon={<Save className="h-4 w-4" />}
              onClick={handleSavePersonal}
              loading={savingProfile}
            >
              Enregistrer
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/40 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-slate-900/90 p-3 text-white shadow-sm dark:bg-white/90 dark:text-slate-900">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Préférences
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Thème, langue et alertes e-mail pour l’ensemble de l’interface.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                Langue
              </p>
              <Select
                value={preferences.language}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    language: value as PreferencesForm["language"],
                  }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl border border-slate-200/70 bg-white/80 px-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                  {LANG_OPTIONS.find((option) => option.value === preferences.language)?.label}
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200/70 bg-white/95 py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  {LANG_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                Thème
              </p>
              <Select
                value={preferences.theme}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    theme: value as PreferencesForm["theme"],
                  }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl border border-slate-200/70 bg-white/80 px-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                  <span className="flex items-center gap-2">
                    {THEME_OPTIONS.find((option) => option.value === preferences.theme)?.icon}
                    {THEME_OPTIONS.find((option) => option.value === preferences.theme)?.label}
                  </span>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200/70 bg-white/95 py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  {THEME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-center rounded-xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Notifications e-mail
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recevoir un résumé lors des nouvelles alertes critiques.
              </p>
              <button
                type="button"
                onClick={handleNotificationsToggle}
                className={`mt-3 inline-flex w-16 items-center justify-between rounded-full px-1 py-1 transition ${
                  preferences.notifications
                    ? "bg-emerald-500/90"
                    : "bg-slate-400/70"
                }`}
                aria-pressed={preferences.notifications}
              >
                <span
                  className={`h-6 w-6 transform rounded-full bg-white shadow transition ${
                    preferences.notifications ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              startIcon={<Save className="h-4 w-4" />}
              onClick={handleSavePreferences}
              loading={savingPreferences}
            >
              Sauvegarder
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/40 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-slate-900/90 p-3 text-white shadow-sm dark:bg-white/90 dark:text-slate-900">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sécurité & sessions
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gérer la réinitialisation du mot de passe et les connexions actives.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Réinitialiser le mot de passe
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Envoie un e-mail sécurisé à {appUser.email} pour choisir un nouveau mot de passe.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handlePasswordReset}
              >
                Envoyer le lien
              </Button>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Déconnexion globale
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Forcer la déconnexion de tous vos appareils (bureau, mobile…).
              </p>
              <Button
                variant="outlineRed"
                size="sm"
                className="mt-3"
                onClick={handleSignOutEverywhere}
              >
                Déconnecter tout
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
