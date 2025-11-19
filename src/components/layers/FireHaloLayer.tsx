// components/layers/FireHaloLayer.tsx
"use client";
import { Fragment } from "react";
import { Circle, Pane, Tooltip } from "react-leaflet";

import { Project } from "@/types/entities/Project";
import { useMapLayers } from "../MapLayersContext";

const CORE_COLOR = "#ef4444";
const WAVE_COLOR = "rgba(248, 113, 113, 0.28)";
const CORE_RADIUS = 38;
const WAVE_RADIUS = 86;

export const FireHaloLayer = ({ fires }: { fires: Project[] }) => {
  const { layers } = useMapLayers();
  if (!layers.fireHalos) return null;

  const showLabels = layers.fireLabels !== false;

  const uniqueFires = Array.from(
    fires
      .reduce((map, fire) => {
        if (!map.has(fire.id)) {
          map.set(fire.id, fire);
        }
        return map;
      }, new Map<string, Project>())
      .values()
  );

  return (
    <Pane name="fire-halos" style={{ zIndex: 440 }}>
      {uniqueFires.map((fire) => {
        if (
          !Number.isFinite(fire.latitude) ||
          !Number.isFinite(fire.longitude)
        ) {
          return null;
        }

        return (
          <Fragment key={fire.id}>
            <Circle
              center={[fire.latitude, fire.longitude]}
              radius={WAVE_RADIUS}
              interactive={false}
              pathOptions={{
                className: "fire-halo-wave",
                color: "transparent",
                fillColor: WAVE_COLOR,
                fillOpacity: 0.35,
                weight: 0,
              }}
            />
            <Circle
              center={[fire.latitude, fire.longitude]}
              radius={CORE_RADIUS}
              interactive={false}
              pathOptions={{
                className: "fire-halo-core",
                color: CORE_COLOR,
                fillColor: CORE_COLOR,
                fillOpacity: 0.4,
                weight: 2,
              }}
            >
              {showLabels && (
                <Tooltip
                  direction="top"
                  offset={[0, -6]}
                  permanent
                  className="fire-tooltip"
                >
                  <div style={{ fontSize: "0.75rem", lineHeight: 1.2 }}>
                    <strong>Départ de feu</strong>
                    <div>{fire.name}</div>
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
