"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Settings2 } from "lucide-react";
import { useState } from "react";
import { useMapLayers } from "../MapLayersContext";

/** Traductions lisibles pour chaque couche */
const LAYER_LABELS: Record<string, string> = {
  fireHalos: "Halo de feu",
  propagationLines: "Propagation (lignes)",
  rangeCircles: "Rayons de propagation",
  threatenedHalos: "Zones menacées",
  projects: "Tous les capteurs",
};

export const LayerTogglePanel = () => {
  const { layers, toggle } = useMapLayers();
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 sm:top-4 sm:bottom-auto z-[1000]">
      {/* Toggle bouton mobile */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="sm:hidden bg-white dark:bg-gray-800 shadow rounded-full p-2"
        aria-label="Options de couches"
      >
        <Settings2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mt-2 sm:mt-0 sm:ml-0 sm:top-20 sm:right-0 sm:absolute bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-lg p-4 text-sm space-y-2 w-60 max-w-[90vw]"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              Couches visibles
            </h3>

            <div className="space-y-1">
              {Object.entries(layers).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  onClick={() => toggle(key as keyof typeof layers)}
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {LAYER_LABELS[key] ?? key}
                  </span>
                  {value ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
