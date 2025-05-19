import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { notify } from '@/lib/notify';

interface RoleTemplate {
  id: string;
  label: string;
  category: string;
  icon: string;
  priority?: number;
}

interface StepRoleSelectProps {
  value: RoleTemplate | null;
  onChange: (role: RoleTemplate | null) => void;
  onNext?: () => void;
}

export default function StepRoleSelect({ value, onChange, onNext }: StepRoleSelectProps) {
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement des rôles
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, "role_templates"));
        const roles = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as RoleTemplate));

        if (roles.length === 0) {
          setError("Aucun rôle disponible");
          notify.info("Aucun rôle disponible dans le système");
        }

        setRoleTemplates(roles);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erreur lors du chargement des rôles";
        setError(errorMessage);
        notify.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Filtrage des rôles avec useMemo pour optimiser les performances
  const filteredRoles = useMemo(() => {
    const searchLower = search.toLowerCase();
    return roleTemplates.filter(role =>
      role.label.toLowerCase().includes(searchLower) ||
      role.category.toLowerCase().includes(searchLower)
    );
  }, [roleTemplates, search]);

  const handleRoleSelect = (role: RoleTemplate) => {
    onChange(role);
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-2">Sélectionner un poste</label>
        <Input
          placeholder="Rechercher un poste..."
          size="lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-1 rounded-sm"
        />
      </div>

      <div className="h-48 overflow-y-auto border border-gray-300 rounded-sm bg-white">
        {loading ? (
          <div className="p-4 text-gray-500">Chargement des rôles...</div>
        ) : error ? (
          <div className="p-4 text-red-500 bg-red-50 rounded-sm">{error}</div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-4 text-gray-400">
            {search ? "Aucun résultat pour cette recherche" : "Aucun rôle disponible"}
          </div>
        ) : (
          filteredRoles.map(role => (
            <div
              key={role.id}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 ${value?.id === role.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
              onClick={() => handleRoleSelect(role)}
            >
              <span className="text-xl">{role.icon}</span>
              <span className="flex-1">{role.label}</span>
              <span className="text-xs text-gray-400">{role.category}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 