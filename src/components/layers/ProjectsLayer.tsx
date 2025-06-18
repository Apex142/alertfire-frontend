// components/layers/ProjectsLayer.tsx
"use client";
import { Project } from "@/types/entities/Project";
import { ArrowRight, Flame, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { CircleMarker, Popup } from "react-leaflet";
import { useMapLayers } from "../MapLayersContext";

const COLORS = { master: "#3b82f6", node: "#22c55e", fire: "#ef4444" };

type Props = {
  projects: Project[];
  activeProjectIds: Set<string>;
  propagations: Record<string, unknown[]>;
};

export const ProjectsLayer = ({
  projects,
  activeProjectIds,
  propagations,
}: Props) => {
  const { layers } = useMapLayers();
  const router = useRouter();

  if (!layers.projects) return null;

  return (
    <>
      {projects.map((p) => {
        const onFire = activeProjectIds.has(p.id) && p.status === "fire";
        const fill = onFire
          ? COLORS.fire
          : p.isMaster
          ? COLORS.master
          : COLORS.node;

        const preds = propagations[p.id] ?? [];

        return (
          <CircleMarker
            key={p.id}
            center={[p.latitude!, p.longitude!]}
            radius={9}
            pathOptions={{
              color: p.isMaster ? COLORS.master : COLORS.node,
              fillColor: fill,
              fillOpacity: 1,
              className: onFire ? "fire-blink" : "",
            }}
          >
            <Popup closeButton={false} className="p-0">
              <div className="p-3 space-y-1 text-sm">
                <h3 className="font-semibold flex items-center gap-1">
                  {onFire && <Flame className="text-red-600" size={14} />}
                  {p.name}
                </h3>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={12} />
                  {p.latitude?.toFixed(5)}, {p.longitude?.toFixed(5)}
                </p>

                {onFire && preds.length > 0 && (
                  <div className="text-xs mt-1">
                    Propagation vers {preds.length} nœud(s)
                  </div>
                )}

                <button
                  onClick={() => router.push(`/sensors/${p.id}`)}
                  className="mt-2 w-full flex items-center justify-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition"
                >
                  Voir le capteur
                  <ArrowRight size={12} />
                </button>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};
