// components/MapLayersContext.tsx
import { createContext, ReactNode, useContext, useState } from "react";

type LayersState = {
  projects: boolean;
  fireHalos: boolean;
  fireLabels: boolean;
  propagationLines: boolean;
  propagationLabels: boolean;
  rangeCircles: boolean;
  rangeLabels: boolean;
  threatenedHalos: boolean;
  threatenedLabels: boolean;
};

export type FiltersState = {
  projectCategory: string;
  alertSeverity: string;
  timeRange: number;
};

const defaultState: LayersState = {
  projects: true,
  fireHalos: true,
  fireLabels: true,
  propagationLines: true,
  propagationLabels: true,
  rangeCircles: true,
  rangeLabels: true,
  threatenedHalos: true,
  threatenedLabels: true,
};

const defaultFilters: FiltersState = {
  projectCategory: "all",
  alertSeverity: "all",
  timeRange: 48,
};

type Ctx = {
  layers: LayersState;
  filters: FiltersState;
  toggle: (key: keyof LayersState) => void;
  setMany: (patch: Partial<LayersState>) => void;
  updateFilters: (patch: Partial<FiltersState>) => void;
  resetFilters: () => void;
  showAll: () => void;
  hideAll: () => void;
  reset: () => void;
};

const MapLayersContext = createContext<Ctx | null>(null);

export const useMapLayers = () => {
  const ctx = useContext(MapLayersContext);
  if (!ctx) throw new Error("useMapLayers must be used within provider");
  return ctx;
};

export const MapLayersProvider = ({ children }: { children: ReactNode }) => {
  const [layers, setLayers] = useState(defaultState);
  const [filters, setFilters] = useState(defaultFilters);

  const toggle = (key: keyof LayersState) =>
    setLayers((s) => ({ ...s, [key]: !s[key] }));

  const setMany = (patch: Partial<LayersState>) =>
    setLayers((prev) => ({ ...prev, ...patch }));

  const updateFilters = (patch: Partial<FiltersState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const resetFilters = () => setFilters({ ...defaultFilters });

  const showAll = () =>
    setLayers(() =>
      Object.fromEntries(
        Object.keys(defaultState).map((key) => [key, true])
      ) as LayersState
    );

  const hideAll = () =>
    setLayers(() =>
      Object.fromEntries(
        Object.keys(defaultState).map((key) => [key, false])
      ) as LayersState
    );

  const reset = () => {
    setLayers({ ...defaultState });
    setFilters({ ...defaultFilters });
  };

  return (
    <MapLayersContext.Provider
      value={{
        layers,
        filters,
        toggle,
        setMany,
        updateFilters,
        resetFilters,
        showAll,
        hideAll,
        reset,
      }}
    >
      {children}
    </MapLayersContext.Provider>
  );
};
