"use client";

import { CompanySelect } from "@/components/CompanySelect";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ProjectPrivacy } from "@/types/enums/ProjectPrivacy";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Building2, ChevronLeft, Eye, LockKeyhole, Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  CreateProjectStoreData,
  useCreateProjectStore,
} from "./useCreateProjectStore";

const step2Schema = z.object({
  companyId: z
    .string({ required_error: "Veuillez sélectionner une compagnie." })
    .min(1, "Veuillez sélectionner une compagnie."),
  privacy: z.nativeEnum(ProjectPrivacy, {
    errorMap: () => ({
      message: "Sélection invalide pour la confidentialité.",
    }),
  }),
});

type Step2FormData = Pick<CreateProjectStoreData, "companyId" | "privacy">;

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export default function Step2CompanyAndPrivacy({ onNext, onBack }: Step2Props) {
  const { data: storeData, setData: setStoreData } = useCreateProjectStore();
  const { appUser } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      companyId: storeData.companyId || appUser?.companySelected || "",
      privacy: storeData.privacy || ProjectPrivacy.PRIVATE,
    },
  });

  useEffect(() => {
    const subscription = watch((value) =>
      setStoreData(value as Partial<CreateProjectStoreData>)
    );
    return () => subscription.unsubscribe();
  }, [watch, setStoreData]);

  const onSubmit = (values: Step2FormData) => {
    setStoreData(values);
    onNext();
  };

  const watchedPrivacy = watch("privacy");

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg p-1 md:p-4 mx-auto"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Compagnie & Confidentialité
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Définissez qui peut voir et accéder à ce projet.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <label
            htmlFor="companyIdSelect"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />{" "}
            Compagnie affiliée *
          </label>
          <Controller
            name="companyId"
            control={control}
            render={({ field }) => (
              <CompanySelect
                id="companyIdSelect"
                value={field.value}
                onChange={field.onChange}
                error={errors.companyId?.message}
                disabled={isSubmitting || !appUser}
                placeholder="Choisir une entité..."
              />
            )}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            À quelle entité votre projet sera-t-il rattaché ?
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confidentialité du projet *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.values(ProjectPrivacy) as ProjectPrivacy[]).map(
              (privacyValue) => {
                const Icon =
                  privacyValue === ProjectPrivacy.PUBLIC ? Eye : LockKeyhole;
                const labelText =
                  privacyValue === ProjectPrivacy.PUBLIC
                    ? "Public (Visible par l'organisation)"
                    : "Privé (Membres invités uniquement)";
                return (
                  <Button
                    type="button"
                    key={privacyValue}
                    variant={
                      watchedPrivacy === privacyValue ? "solid" : "outline"
                    }
                    colorScheme={
                      watchedPrivacy === privacyValue ? "primary" : "gray"
                    }
                    onClick={() =>
                      setValue("privacy", privacyValue, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "w-full text-sm justify-center py-2.5 h-auto items-center",
                      watchedPrivacy === privacyValue &&
                        "ring-2 ring-offset-1 ring-primary-focus dark:ring-offset-gray-900 dark:ring-primary-dark-focus"
                    )}
                    disabled={isSubmitting}
                    IconLeft={Icon}
                  >
                    {privacyValue.charAt(0).toUpperCase() +
                      privacyValue.slice(1)}
                  </Button>
                );
              }
            )}
          </div>
          {errors.privacy && (
            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
              {errors.privacy.message}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            <b>Public</b> : visible par tous les membres de la compagnie
            sélectionnée.
            <br />
            <b>Privé</b> : visible uniquement par les membres explicitement
            ajoutés au projet.
          </p>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700 mt-10">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2"
          >
            <ChevronLeft className="w-5 h-5" /> Précédent
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5"
          >
            {isSubmitting ? "Finalisation..." : "Terminer et Créer"}{" "}
            <Save className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
