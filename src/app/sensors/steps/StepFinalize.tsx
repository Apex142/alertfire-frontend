"use client";

import Button from "@/components/ui/button";
import { useProjectWizard } from "@/hooks/useProjectWizard";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useState } from "react";

export default function StepFinalize({
  data,
  update,
}: ReturnType<typeof useProjectWizard>) {
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = prompt("Simulation : scannez ou collez l’UUID");
      if (result) update({ manualId: result });
    } finally {
      setScanning(false);
    }
  };

  const isFilled = !!data.manualId?.trim();

  return (
    <motion.div
      className="space-y-6 px-4 md:px-6 py-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold text-foreground">
          Associer l’identifiant matériel
        </h3>
        <p className="text-sm text-muted-foreground">
          Saisissez manuellement l’UUID visible sur le capteur, ou scannez le
          QR-code.
        </p>
      </div>

      {/* Entrée manuelle */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Entrer l’identifiant
        </label>
        <input
          type="text"
          placeholder="uuid-xxxx-xxxx-xxxx"
          value={data.manualId ?? ""}
          onChange={(e) => update({ manualId: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {isFilled ? (
          <p className="mt-1 text-xs text-green-600">
            Identifiant enregistré ✓
          </p>
        ) : (
          <p className="mt-1 text-xs text-red-500">
            L’identifiant est obligatoire pour créer le projet.
          </p>
        )}
      </div>

      {/* Séparateur visuel */}
      <div className="flex items-center gap-4 text-muted-foreground text-sm">
        <div className="h-px flex-1 bg-border" />
        ou
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Bouton de scan */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          startIcon={<Camera size={18} />}
          loading={scanning}
          onClick={handleScan}
        >
          Scanner le QR-code
        </Button>
      </div>
    </motion.div>
  );
}
