"use client";

import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useFirefighters } from "@/hooks/useFirefighters";
import { useProjectWizard } from "@/hooks/useProjectWizard";
import { useTechnicians } from "@/hooks/useTechnicians";
import { GlobalRole } from "@/types/enums/GlobalRole";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

/* Liste toggleable réutilisable */
function ToggleList({
  items,
  selected,
  onToggle,
}: {
  items: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((u) => (
        <Button
          key={u.id}
          isFullWidth
          variant={selected.includes(u.id) ? "primary" : "outline"}
          onClick={() => onToggle(u.id)}
        >
          {u.name}
        </Button>
      ))}
    </div>
  );
}

export default function StepAssign({
  data,
  update,
}: ReturnType<typeof useProjectWizard>) {
  const { technicians, loading: loadingTechs } = useTechnicians();
  const { firefighters, loading: loadingFires } = useFirefighters();
  const { appUser } = useAuth();

  // Ajout automatique de l’utilisateur connecté s’il est technicien
  useEffect(() => {
    if (
      Array.isArray(appUser?.globalRole) &&
      appUser.globalRole.includes(GlobalRole.TECHNICIAN) &&
      !data.technicianIds.includes(appUser.uid)
    ) {
      update({ technicianIds: [...data.technicianIds, appUser.uid] });
    }
  }, [appUser, data.technicianIds, update]);

  // Ajout automatique si pompier
  useEffect(() => {
    if (
      Array.isArray(appUser?.globalRole) &&
      appUser.globalRole.includes(GlobalRole.FIREFIGHTER) &&
      !data.firefighterIds.includes(appUser.uid)
    ) {
      update({ firefighterIds: [...data.firefighterIds, appUser.uid] });
    }
  }, [appUser, data.firefighterIds, update]);

  const toggle = (field: "technicianIds" | "firefighterIds", id: string) => {
    const list = data[field].includes(id)
      ? data[field].filter((i) => i !== id)
      : [...data[field], id];
    update({ [field]: list } as any);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* TECHNICIENS */}
      <div>
        <h3 className="font-semibold mb-2">Techniciens responsables</h3>
        {loadingTechs ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ToggleList
            items={technicians.map((t) => ({
              id: t.uid,
              name: t.displayName,
            }))}
            selected={data.technicianIds}
            onToggle={(id) => toggle("technicianIds", id)}
          />
        )}
      </div>

      {/* POMPIERS */}
      <div>
        <h3 className="font-semibold mb-2">Pompiers affectés</h3>
        {loadingFires ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ToggleList
            items={firefighters.map((f) => ({
              id: f.uid,
              name: f.displayName,
            }))}
            selected={data.firefighterIds}
            onToggle={(id) => toggle("firefighterIds", id)}
          />
        )}
      </div>
    </div>
  );
}
