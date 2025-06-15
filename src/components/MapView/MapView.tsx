"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";

import { useFireAlerts } from "@/hooks/useFireAlerts";
import { useProjects } from "@/hooks/useProjects";
import { usePropagation } from "@/hooks/usePropagations";
import { haversineKm } from "@/utils/geo";

import { MapLayersProvider } from "../MapLayersContext";
import { LayerTogglePanel } from "../controls/LayerTogglePanel";
import { FireHaloLayer } from "../layers/FireHaloLayer";
import { ProjectsLayer } from "../layers/ProjectsLayer";
import { PropagationLinesLayer } from "../layers/PropagationLinesLayer";
import { RangeCirclesLayer } from "../layers/RangeCirclesLayer";
import { ThreatenedLayer } from "../layers/ThreatenedLayer";

import { useMemo, useRef } from "react";

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);

  const { projects } = useProjects();
  const { activeProjectIds } = useFireAlerts();
  const { propagations } = usePropagation(activeProjectIds, 48);

  const geoProjects = useMemo(
    () => projects.filter((p) => p.latitude && p.longitude),
    [projects]
  );

  const fires = useMemo(
    () =>
      geoProjects.filter(
        (p) => activeProjectIds.has(p.id) && p.status === "fire"
      ),
    [geoProjects, activeProjectIds]
  );

  const threatened = useMemo(() => {
    const ids = new Set<string>();
    Object.values(propagations).forEach((arr) =>
      arr.forEach((pr) => pr.will_reach && ids.add(pr.node_id))
    );
    return geoProjects.filter(
      (p) => ids.has(p.id) && !fires.some((f) => f.id === p.id)
    );
  }, [geoProjects, propagations, fires]);

  const { links, circles } = useMemo(() => {
    const ln: { origin: any; target: any }[] = [];
    const cir: { center: any; radiusM: number }[] = [];

    fires.forEach((o) => {
      (propagations[o.id] ?? [])
        .filter((pr) => pr.will_reach)
        .forEach((pr) => {
          const t = geoProjects.find((p) => p.id === pr.node_id);
          if (t) {
            ln.push({ origin: o, target: t });
            cir.push({
              center: o,
              radiusM: haversineKm(o, t) * 1000,
            });
          }
        });
    });

    return { links: ln, circles: cir };
  }, [fires, propagations, geoProjects]);

  const center: [number, number] =
    geoProjects.length > 0
      ? [geoProjects[0].latitude!, geoProjects[0].longitude!]
      : [43.2306, 5.4576]; // fallback sur la forêt de Luminy

  return (
    <MapLayersProvider>
      <LayerTogglePanel />

      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
        whenCreated={(m) => (mapRef.current = m)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        <ProjectsLayer
          projects={geoProjects}
          activeProjectIds={activeProjectIds}
          propagations={propagations}
        />
        <FireHaloLayer fires={fires} />
        <ThreatenedLayer projects={threatened} />
        <PropagationLinesLayer links={links} />
        <RangeCirclesLayer circles={circles} />
      </MapContainer>

      <style jsx global>{`
        @keyframes fire-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.25;
          }
        }
        .leaflet-interactive.fire-blink {
          animation: fire-blink 1s infinite;
        }
      `}</style>
    </MapLayersProvider>
  );
}
