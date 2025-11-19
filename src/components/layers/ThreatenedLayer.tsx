// components/layers/ThreatenedLayer.tsx
"use client";
import { Fragment } from "react";
import { Circle, Pane, Tooltip } from "react-leaflet";

import { Project } from "@/types/entities/Project";
import { useMapLayers } from "../MapLayersContext";

const RING_COLOR = "#f43f5e";
const HALO_COLOR = "rgba(251, 113, 133, 0.22)";
const BASE_RADIUS = 45;

export const ThreatenedLayer = ({ projects }: { projects: Project[] }) => {
  const { layers } = useMapLayers();
  if (!layers.threatenedHalos) return null;

  const showLabels = layers.threatenedLabels !== false;

  const uniqueProjects = Array.from(
    projects.reduce((map, project) => {
      if (!map.has(project.id)) {
        map.set(project.id, project);
      }
      return map;
    }, new Map<string, Project>()).values()
  );

  return (
    <Pane name="threatened-zones" style={{ zIndex: 410 }}>
      {uniqueProjects.map((project) => {
        if (
          !Number.isFinite(project.latitude) ||
          !Number.isFinite(project.longitude)
        ) {
          return null;
        }

        const key = `${project.id}-threat`;

        return (
          <Fragment key={key}>
            <Circle
              center={[project.latitude, project.longitude]}
              radius={BASE_RADIUS * 2}
              interactive={false}
              pathOptions={{
                className: "threatened-zone-halo",
                color: "transparent",
                fillColor: HALO_COLOR,
                fillOpacity: 0.24,
                weight: 0,
              }}
            />
            <Circle
              center={[project.latitude, project.longitude]}
              radius={BASE_RADIUS}
              interactive={false}
              pathOptions={{
                className: "threatened-zone-ring",
                color: RING_COLOR,
                fillColor: "rgba(244, 63, 94, 0.18)",
                fillOpacity: 0.24,
                weight: 1.5,
                dashArray: "8 10",
              }}
            >
              {showLabels && (
                <Tooltip
                  direction="top"
                  offset={[0, -8]}
                  permanent
                  className="threat-tooltip"
                >
                  <div style={{ fontSize: "0.72rem", lineHeight: 1.2 }}>
                    <strong>{project.name}</strong>
                    <div>Zone menacée</div>
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
