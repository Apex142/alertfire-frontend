"use client";

import StepAssign from "@/app/sensors/steps/StepAssign";
import StepDetails from "@/app/sensors/steps/StepDetails";
import StepFinalize from "@/app/sensors/steps/StepFinalize";
import StepLocation from "@/app/sensors/steps/StepLocation";
import StepSuccess from "@/app/sensors/steps/StepSuccess";
import { useProjectWizard } from "@/hooks/useProjectWizard";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../ui/Button";

export default function AddProjectWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const wizard = useProjectWizard();
  const { step, prev, next, submit, loading, data, submitted } = wizard;
  const totalSteps = 4;

  const handleClose = () => !loading && onClose();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden border border-border flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
                  {submitted
                    ? "Projet créé avec succès"
                    : "Créer un nouveau projet"}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition"
                  onClick={handleClose}
                  disabled={loading}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Progress bar */}
              {!submitted && (
                <>
                  <div className="relative h-2 bg-muted w-full rounded-sm mx-6 mt-4 mb-2">
                    <motion.div
                      className="h-2 rounded-sm bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <div className="flex justify-between px-6 pb-3 text-xs text-muted-foreground">
                    {["Détails", "Localisation", "Affectations", "UUID"].map(
                      (label, i) => (
                        <span
                          key={label}
                          className={`${
                            i === step ? "text-primary font-medium" : ""
                          }`}
                        >
                          {label}
                        </span>
                      )
                    )}
                  </div>
                </>
              )}

              {/* Step content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {submitted ? (
                  <StepSuccess />
                ) : (
                  <>
                    {step === 0 && <StepDetails {...wizard} />}
                    {step === 1 && <StepLocation {...wizard} />}
                    {step === 2 && <StepAssign {...wizard} />}
                    {step === 3 && <StepFinalize {...wizard} />}
                  </>
                )}
              </div>

              {/* Footer */}
              {!submitted && (
                <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-t border-border">
                  <Button variant="ghost" onClick={prev} disabled={step === 0}>
                    Précédent
                  </Button>
                  {step < totalSteps - 1 ? (
                    <Button
                      onClick={next}
                      disabled={
                        step === 0
                          ? !data.name.trim()
                          : step === 1
                          ? !data.latitude || !data.longitude
                          : false
                      }
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      loading={loading}
                      onClick={submit}
                      disabled={
                        !data.name.trim() ||
                        !data.latitude ||
                        !data.longitude ||
                        data.technicianIds.length === 0 ||
                        !data.manualId?.trim()
                      }
                    >
                      Créer le projet
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
