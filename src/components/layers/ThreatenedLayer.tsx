// components/layers/ThreatenedLayer.tsx
"use client";
import { Project } from "@/types/entities/Project";
import { Circle } from "react-leaflet";
import { useMapLayers } from "../MapLayersContext";

const COLOR = "#ef4444";

export const ThreatenedLayer = ({ projects }: { projects: Project[] }) => {
  const { layers } = useMapLayers();
  if (!layers.threatenedHalos) return null;

  return (
    <>
      {projects.map((p) => (
        <Circle
          key={`${p.id}-threat`}
          center={[p.latitude!, p.longitude!]}
          radius={30}
          interactive={false}
          pathOptions={{
            color: COLOR,
            fillColor: COLOR,
            fillOpacity: 0.15,
            weight: 1,
          }}
        />
      ))}
    </>
  );
};
