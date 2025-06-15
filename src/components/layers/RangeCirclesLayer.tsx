// components/layers/RangeCirclesLayer.tsx
"use client";
import { Project } from "@/types/entities/Project";
import { Circle } from "react-leaflet";
import { useMapLayers } from "../MapLayersContext";

const COLOR = "#B51E1E";

export const RangeCirclesLayer = ({
  circles,
}: {
  circles: { center: Project; radiusM: number }[];
}) => {
  const { layers } = useMapLayers();
  if (!layers.rangeCircles) return null;

  return (
    <>
      {circles.map(({ center, radiusM }) => (
        <Circle
          key={`${center.id}-range`}
          center={[center.latitude!, center.longitude!]}
          radius={radiusM}
          interactive={false}
          pathOptions={{
            color: COLOR,
            fillColor: COLOR,
            fillOpacity: 0.15,
            weight: 1,
            dashArray: "2 6",
          }}
        />
      ))}
    </>
  );
};
