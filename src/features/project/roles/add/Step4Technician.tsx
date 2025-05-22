"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUsers } from "@/hooks/useUser"; // <--- le hook centralisé
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

interface Technician {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
}

type ActionType = "force" | "invite";

interface StepTechnicianProps {
  selectedTechnician: Technician | null;
  setSelectedTechnician: (tech: Technician | null) => void;
  selectedAction: ActionType | null;
  setSelectedAction: (action: ActionType) => void;
}

export default function StepTechnician({
  selectedTechnician,
  setSelectedTechnician,
  selectedAction,
  setSelectedAction,
}: StepTechnicianProps) {
  // Utilise le hook
  const { users, loading, error } = useUsers(); // Tu peux filtrer si besoin
  const [search, setSearch] = useState("");

  // Adaptation FirestoreUser -> Technician (si tu veux garder un type simple ici)
  const technicians: Technician[] = useMemo(
    () =>
      users.map((user) => ({
        uid: user.uid,
        name:
          user.displayName ||
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.email ||
          "Inconnu",
        email: user.email || "",
        phone: user.phone || "",
        specialties: user.preferences?.specialties || [], // à adapter selon ton modèle
      })),
    [users]
  );

  const filteredTechnicians = useMemo(
    () =>
      technicians.filter((tech) =>
        `${tech.name} ${tech.email} ${tech.phone ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [technicians, search]
  );

  return (
    <div className="space-y-8">
      {/* Recherche */}
      <div>
        <label className="block font-semibold text-gray-700 mb-2">
          Rechercher un technicien
        </label>
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, email ou téléphone…"
            className={clsx(
              "pl-11 h-11 text-base font-medium rounded-xl border border-slate-200 bg-white/80 shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition",
              "placeholder:text-base"
            )}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 pointer-events-none" />
        </div>
      </div>

      {/* Liste des techniciens */}
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-400 py-8 animate-pulse">
            Chargement…
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">
            Erreur lors du chargement : {error}
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="text-center text-gray-300 py-8">
            Aucun technicien trouvé.
          </div>
        ) : (
          <ul className="space-y-1">
            <AnimatePresence initial={false}>
              {filteredTechnicians.map((tech) => {
                const selected = selectedTechnician?.uid === tech.uid;
                return (
                  <motion.li
                    key={tech.uid}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.12 }}
                  >
                    <button
                      type="button"
                      className={clsx(
                        "w-full flex justify-between items-center gap-3 p-3 rounded-xl border transition shadow-sm group relative",
                        selected
                          ? "bg-gradient-to-tr from-primary/10 to-blue-50 border-primary/50 ring-2 ring-primary/20"
                          : "bg-white border-slate-200 hover:bg-blue-50/70"
                      )}
                      onClick={() => setSelectedTechnician(tech)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-base">
                            {tech.name}
                          </span>
                          {selected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 ml-1 text-xs bg-primary text-white rounded-full shadow animate-in fade-in">
                              <Check className="w-3 h-3 mr-1" />
                              Sélectionné
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-500">
                            {tech.email}
                          </span>
                          {tech.phone && (
                            <span className="text-xs text-gray-400">
                              {tech.phone}
                            </span>
                          )}
                        </div>
                        {tech.specialties && tech.specialties.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {tech.specialties.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-slate-100 rounded text-xs text-primary/80 border border-slate-200"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span>
                        {selected ? (
                          <Check className="w-5 h-5 text-primary" />
                        ) : (
                          <UserPlus className="w-5 h-5 text-gray-300 group-hover:text-primary transition" />
                        )}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Actions */}
      <div>
        <label className="block font-semibold text-gray-700 mb-2">
          Action à effectuer
        </label>
        <div className="flex flex-row gap-3">
          <Button
            type="button"
            variant={selectedAction === "force" ? "primary" : "outline"}
            className={clsx(
              "flex-1 flex items-center gap-2 rounded-lg py-2 shadow-sm text-sm font-semibold",
              !selectedTechnician && "opacity-50 pointer-events-none"
            )}
            onClick={() => setSelectedAction("force")}
            disabled={!selectedTechnician}
          >
            <UserPlus className="w-4 h-4" />
            Ajouter sans invitation
          </Button>
          <Button
            type="button"
            variant={selectedAction === "invite" ? "primary" : "outline"}
            className={clsx(
              "flex-1 flex items-center gap-2 rounded-lg py-2 shadow-sm text-sm font-semibold",
              !selectedTechnician && "opacity-50 pointer-events-none"
            )}
            onClick={() => setSelectedAction("invite")}
            disabled={!selectedTechnician}
          >
            <Mail className="w-4 h-4" />
            Envoyer une invitation
          </Button>
        </div>
      </div>
    </div>
  );
}
