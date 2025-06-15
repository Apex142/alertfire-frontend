// src/app/sensors/steps/StepSuccess.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function StepSuccess() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 py-12"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.div
        initial={{ rotate: -90 }}
        animate={{ rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <CheckCircle2
          size={96}
          className="text-green-600 dark:text-green-400"
        />
      </motion.div>

      <motion.h3
        className="text-xl font-semibold text-foreground text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        Projet créé avec succès&nbsp;!
      </motion.h3>

      <p className="max-w-sm text-center text-muted-foreground">
        Vous pouvez le retrouver dès maintenant dans la&nbsp;liste des projets.
      </p>
    </motion.div>
  );
}
