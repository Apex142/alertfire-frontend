import { Input } from "@/components/ui/Input";
import { useRoleTemplates } from "@/hooks/useRoleTemplates";
import { notify } from "@/lib/notify";
import { RoleTemplate } from "@/types/entities/RoleTemplate";
import { AnimatePresence, motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useMemo, useState } from "react";

// Utilitaire pour récupérer l'icône Lucide dynamiquement
function getLucideIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName];
  return Icon ? <Icon className="w-5 h-5 text-primary" /> : null;
}

interface StepRoleSelectProps {
  value: RoleTemplate | null;
  onChange: (role: RoleTemplate | null) => void;
  onNext?: () => void;
}

export default function StepRoleSelect({
  value,
  onChange,
  onNext,
}: StepRoleSelectProps) {
  const { roles: roleTemplates, loading, error } = useRoleTemplates();
  const [search, setSearch] = useState("");

  // Petite notification si aucun rôle
  if (!loading && roleTemplates.length === 0) {
    notify.info("Aucun rôle disponible dans le système");
  }

  const filteredRoles = useMemo(() => {
    const searchLower = search.toLowerCase();
    return roleTemplates.filter(
      (role) =>
        role.label.toLowerCase().includes(searchLower) ||
        role.category.toLowerCase().includes(searchLower)
    );
  }, [roleTemplates, search]);

  const handleRoleSelect = (role: RoleTemplate) => {
    onChange(role);
    if (onNext) onNext();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold text-gray-700 mb-2">
          Sélectionner un poste
        </label>
        <Input
          placeholder="Rechercher un poste…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-14 text-lg font-semibold rounded-2xl border-2 border-primary/30 bg-white/90 shadow-lg focus:ring-2 focus:ring-primary focus:border-primary transition placeholder:text-base placeholder:font-medium pl-6"
        />
      </div>

      <div className="h-56 overflow-y-auto rounded-xl bg-slate-50/90 border border-slate-200 shadow-inner">
        {loading ? (
          <div className="p-6 text-gray-400 animate-pulse">
            Chargement des rôles…
          </div>
        ) : error ? (
          <div className="p-6 text-red-500 bg-red-50 rounded-xl">{error}</div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-6 text-gray-400">
            {search
              ? "Aucun résultat pour cette recherche"
              : "Aucun rôle disponible"}
          </div>
        ) : (
          <ul>
            <AnimatePresence>
              {filteredRoles.map((role) => {
                const isSelected = value?.id === role.id;
                const LucideIcon = getLucideIcon(role.icon);
                return (
                  <motion.li
                    key={role.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      type="button"
                      className={`
                        w-full flex items-center gap-3 px-4 py-2 rounded-lg transition
                        ${
                          isSelected
                            ? "bg-gradient-to-r from-primary/10 to-blue-200/30 border-l-4 border-primary shadow"
                            : "hover:bg-slate-100/80"
                        }
                        focus:outline-none
                      `}
                      onClick={() => handleRoleSelect(role)}
                    >
                      <span className="text-xl">{LucideIcon || role.icon}</span>
                      <span className="flex-1 text-left font-medium text-gray-900">
                        {role.label}
                      </span>
                      <span className="text-xs rounded px-2 py-0.5 bg-slate-100 text-primary/80 border border-slate-200">
                        {role.category}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
