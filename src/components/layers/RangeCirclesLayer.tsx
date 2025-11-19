// components/layers/RangeCirclesLayer.tsx
"use client";
import { Fragment } from "react";
import { Circle, Pane, Tooltip } from "react-leaflet";

import { Project } from "@/types/entities/Project";
import { formatDistance } from "@/utils/geo";
import { useMapLayers } from "../MapLayersContext";

const RING_COLOR = "#fb923c";
const HALO_MULTIPLIER = 1.08;

export const RangeCirclesLayer = ({
  circles,
}: {
  circles: { center: Project; radiusM: number }[];
}) => {
  const { layers } = useMapLayers();
  if (!layers.rangeCircles) return null;

  const showLabels = layers.rangeLabels !== false;

  const deduped = circles.reduce((map, entry) => {
    const centerId = entry.center.id;
    const existing = map.get(centerId);
    if (!existing || entry.radiusM > existing.radiusM) {
      map.set(centerId, entry);
    }
    return map;
  }, new Map<string, { center: Project; radiusM: number }>());

  const uniqueCircles = Array.from(deduped.values());

  return (
    <Pane name="range-circles" style={{ zIndex: 420 }}>
      {uniqueCircles.map(({ center, radiusM }) => {
        if (
          !radiusM ||
          !Number.isFinite(center.latitude) ||
          !Number.isFinite(center.longitude)
        ) {
          return null;
        }
        const haloRadius = Math.max(radiusM * HALO_MULTIPLIER, radiusM + 120);
        const key = `${center.id}-range-${Math.round(radiusM)}`;
        const distanceLabel = formatDistance(radiusM);

        return (
          <Fragment key={key}>
            <Circle
              center={[center.latitude, center.longitude]}
              radius={haloRadius}
              interactive={false}
              pathOptions={{
                className: "range-circle-halo",
                color: "transparent",
                fillColor: "rgba(251, 146, 60, 0.15)",
                fillOpacity: 0.25,
                weight: 0,
              }}
            />

            <Circle
              center={[center.latitude, center.longitude]}
              radius={radiusM}
              interactive={false}
              pathOptions={{
                className: "range-circle-ring",
                color: RING_COLOR,
                fillColor: "rgba(251, 146, 60, 0.08)",
                fillOpacity: 0.16,
                opacity: 0.9,
                weight: 2,
                dashArray: "16 12",
              }}
            >
              {showLabels && (
                <Tooltip
                  direction="top"
                  offset={[0, -12]}
                  permanent
                  className="range-tooltip"
                >
                  <div style={{ fontSize: "0.75rem", lineHeight: 1.2 }}>
                    <strong>{center.name}</strong>
                    <div>Propagation potentielle</div>
                    <div>{distanceLabel}</div>
                  </div>
                </Tooltip>
              )}
            </Circle>
          </Fragment>
        );
      })}
    </Pane>
  );
};
