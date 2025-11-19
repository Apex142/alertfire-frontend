// components/layers/PropagationLinesLayer.tsx
"use client";
import { Polyline, Pane, Tooltip } from "react-leaflet";

import { Project } from "@/types/entities/Project";
import { haversineKm, formatDistance } from "@/utils/geo";
import { useMapLayers } from "../MapLayersContext";

const LINE_COLOR = "#f97316";

export const PropagationLinesLayer = ({
  links,
}: {
  links: { origin: Project; target: Project }[];
}) => {
  const { layers } = useMapLayers();
  if (!layers.propagationLines) return null;

  const showLabels = layers.propagationLabels !== false;

  return (
    <Pane name="propagation-lines" style={{ zIndex: 430 }}>
      {links.map(({ origin, target }) => {
        if (
          !Number.isFinite(origin.latitude) ||
          !Number.isFinite(origin.longitude) ||
          !Number.isFinite(target.latitude) ||
          !Number.isFinite(target.longitude)
        ) {
          return null;
        }

        const distanceMeters = haversineKm(origin, target) * 1000;
        const label = formatDistance(distanceMeters);

        return (
          <Polyline
            key={`${origin.id}-${target.id}`}
            positions={[
              [origin.latitude, origin.longitude],
              [target.latitude, target.longitude],
            ]}
            pathOptions={{
              className: "propagation-line",
              color: LINE_COLOR,
              weight: 3,
              opacity: 0.95,
              dashArray: "14 10",
              lineCap: "round",
            }}
          >
            {showLabels && (
              <Tooltip sticky className="propagation-tooltip">
                <div style={{ fontSize: "0.75rem", lineHeight: 1.3 }}>
                  <strong>{origin.name}</strong> ➜ {target.name}
                  <div>{label}</div>
                </div>
              </Tooltip>
            )}
          </Polyline>
        );
      })}
    </Pane>
  );
};
