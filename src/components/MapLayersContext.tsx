// components/MapLayersContext.tsx
import { createContext, ReactNode, useContext, useState } from "react";

type LayersState = {
  projects: boolean;
  fireHalos: boolean;
  propagationLines: boolean;
  rangeCircles: boolean;
  threatenedHalos: boolean;
};

const defaultState: LayersState = {
  projects: true,
  fireHalos: true,
  propagationLines: true,
  rangeCircles: true,
  threatenedHalos: true,
};

type Ctx = {
  layers: LayersState;
  toggle: (key: keyof LayersState) => void;
};

const MapLayersContext = createContext<Ctx | null>(null);

export const useMapLayers = () => {
  const ctx = useContext(MapLayersContext);
  if (!ctx) throw new Error("useMapLayers must be used within provider");
  return ctx;
};

export const MapLayersProvider = ({ children }: { children: ReactNode }) => {
  const [layers, setLayers] = useState(defaultState);

  const toggle = (key: keyof LayersState) =>
    setLayers((s) => ({ ...s, [key]: !s[key] }));

  return (
    <MapLayersContext.Provider value={{ layers, toggle }}>
      {children}
    </MapLayersContext.Provider>
  );
};
