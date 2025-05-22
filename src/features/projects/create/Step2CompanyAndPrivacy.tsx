"use client";

import { CompanySelect } from "@/components/CompanySelect";
import { Button } from "@/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuth } from "firebase/auth";
import { Building2, Eye, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateProjectStore } from "./useCreateProjectStore";

const schema = z.object({
  companyId: z.string().min(1, "Sélectionnez une entreprise"),
  privacy: z.enum(["public", "privé"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onNext: (values: FormValues) => void;
  onBack?: () => void;
  defaultValues?: Partial<FormValues>;
}

export default function Step2CompanyAndPrivacy({
  onNext,
  onBack,
  defaultValues,
}: Props) {
  const { data: projectData } = useCreateProjectStore();
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<
    "idle" | "creating" | "membership"
  >("idle");

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      privacy: defaultValues?.privacy || "privé",
    },
  });

  const handleSave = async (data: FormValues) => {
    setIsLoading(true);
    try {
      onNext(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (!isLoading) return "Enregistrer";
    switch (loadingStep) {
      case "creating":
        return "Création du project...";
      case "membership":
        return "Accueil des utilisateurs...";
      default:
        return "Enregistrer";
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleSave)}
      className="space-y-6 max-w-lg mx-auto px-4"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Entreprise
        </label>
        <Controller
          control={control}
          name="companyId"
          render={({ field }) => (
            <CompanySelect
              value={field.value}
              onChange={field.onChange}
              error={errors.companyId?.message}
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          À quelle entité sera rattaché le project&nbsp;?
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <LockKeyhole className="w-4 h-4 text-primary" /> Confidentialité
        </label>
        <Controller
          control={control}
          name="privacy"
          render={({ field }) => (
            <div className="flex gap-2">
              {[
                { value: "public", label: "Public", Icon: Eye },
                { value: "privé", label: "Privé", Icon: LockKeyhole },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded font-medium border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${
                      field.value === value
                        ? value === "public"
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-gray-700 text-white border-gray-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => field.onChange(value)}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Un project public est visible par tous les membres. Un project privé
          n'est visible que par les membres concernés.
        </p>
        {errors.privacy && (
          <div className="text-red-500 text-xs mt-1">
            {errors.privacy.message}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Précédent
          </Button>
        )}
        <Button type="submit" size="lg" variant="primary" disabled={isLoading}>
          {getButtonText()}
        </Button>
      </div>
    </form>
  );
}
