// components/layers/PropagationLinesLayer.tsx
"use client";
import { Project } from "@/types/entities/Project";
import { Polyline } from "react-leaflet";
import { useMapLayers } from "../MapLayersContext";

const COLOR = "#B51E1E";

export const PropagationLinesLayer = ({
  links,
}: {
  links: { origin: Project; target: Project }[];
}) => {
  const { layers } = useMapLayers();
  if (!layers.propagationLines) return null;

  return (
    <>
      {links.map(({ origin, target }) => (
        <Polyline
          key={`${origin.id}-${target.id}`}
          positions={[
            [origin.latitude!, origin.longitude!],
            [target.latitude!, target.longitude!],
          ]}
          pathOptions={{ color: COLOR, weight: 4, dashArray: "6 6" }}
        />
      ))}
    </>
  );
};
