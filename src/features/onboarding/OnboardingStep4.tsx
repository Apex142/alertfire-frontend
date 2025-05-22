import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

const schema = z.object({
  intent: z.enum(["organizer", "technician", "unknown"], {
    required_error: "Merci de choisir une option",
  }),
});

type FormData = z.infer<typeof schema>;

type Props = {
  onNext: (nextStep?: "5" | "6") => void;
};

const INTENT_OPTIONS = [
  {
    value: "organizer",
    label: "Je vais créer et gérer des projects",
    icon: "🗂️",
    next: "5",
  },
  {
    value: "technician",
    label: "Je vais participer à des projects",
    icon: "🛠️",
    next: "6",
  },
  {
    value: "unknown",
    label: "Je ne sais pas encore",
    icon: "❓",
    next: "6",
  },
];

export default function OnboardingStep4({ onNext }: Props) {
  const { user } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const handleSelect = async (
    value: "organizer" | "technician" | "unknown"
  ) => {
    setValue("intent", value);
    // On valide et soumet immédiatement
    const data = { intent: value };
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          intent: value,
          onboardingStep: value === "organizer" ? 5 : 6,
        },
        { merge: true }
      );
    }
    onNext(value === "organizer" ? "5" : "6");
  };

  return (
    <form className="flex flex-col items-center justify-center h-full w-full p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🎯 Quelles sont tes intentions sur l'app&nbsp;?
      </h2>
      <Controller
        name="intent"
        control={control}
        render={({ field }) => (
          <div className="w-full flex flex-col gap-4 mb-6">
            {INTENT_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`w-full flex hover:cursor-pointer items-center gap-4 p-4 rounded-xl border transition shadow-sm text-left text-lg font-medium
                  ${
                    field.value === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-white hover:bg-primary/5"
                  }`}
                onClick={() =>
                  handleSelect(
                    opt.value as "organizer" | "technician" | "unknown"
                  )
                }
                disabled={isSubmitting}
              >
                <span className="text-2xl">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
            {errors.intent && (
              <div className="text-red-600 text-sm mt-1">
                {errors.intent.message}
              </div>
            )}
          </div>
        )}
      />
    </form>
  );
}
