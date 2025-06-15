"use client";

import { useProjectWizard } from "@/hooks/useProjectWizard";
import { motion } from "framer-motion";
import {
  Landmark,
  Server,
  ServerCog,
  ShieldCheck,
  StickyNote,
} from "lucide-react";

export default function StepDetails({
  update,
  data,
}: ReturnType<typeof useProjectWizard>) {
  const isMaster = data.isMaster;

  return (
    <div className="grid gap-6">
      {/* Nom du projet */}
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Landmark size={16} className="text-primary" />
          Nom du projet
        </label>
        <input
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Ex. : Capteur Nord"
          className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <StickyNote size={16} className="text-primary" />
          Description
        </label>
        <textarea
          rows={3}
          value={data.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Notes, remarques, configuration particulière…"
          className="w-full resize-none rounded-lg border border-border bg-muted px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Type de nœud */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ServerCog size={16} className="text-primary" />
          Type de nœud
        </label>

        <div className="grid grid-cols-2 gap-4 mt-1">
          {/* Maître */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => update({ isMaster: true })}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-3 border text-sm transition-all
              ${
                isMaster
                  ? "bg-primary text-white border-primary shadow"
                  : "bg-muted text-foreground border-border hover:bg-accent"
              }`}
          >
            <Server size={22} />
            <span>Maître</span>
            {isMaster && <ShieldCheck size={14} className="mt-0.5" />}
          </motion.button>

          {/* Esclave */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => update({ isMaster: false })}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-3 border text-sm transition-all
              ${
                !isMaster
                  ? "bg-primary text-white border-primary shadow"
                  : "bg-muted text-foreground border-border hover:bg-accent"
              }`}
          >
            <Server size={22} className="rotate-180" />
            <span>Esclave</span>
            {!isMaster && <ShieldCheck size={14} className="mt-0.5" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
