// components/layers/FireHaloLayer.tsx
"use client";
import { Project } from "@/types/entities/Project";
import { Circle } from "react-leaflet";
import { useMapLayers } from "../MapLayersContext";

const COLOR = "#991b1b";

export const FireHaloLayer = ({ fires }: { fires: Project[] }) => {
  const { layers } = useMapLayers();
  if (!layers.fireHalos) return null;

  return (
    <>
      {fires.map((p) => (
        <Circle
          key={p.id}
          center={[p.latitude!, p.longitude!]}
          radius={35}
          interactive={false}
          pathOptions={{
            color: COLOR,
            fillColor: COLOR,
            fillOpacity: 0.25,
            weight: 2,
          }}
        />
      ))}
    </>
  );
};
