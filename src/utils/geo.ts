// utils/geo.ts
import { Project } from "@/types/entities/Project";

export const toRad = (deg: number) => (deg * Math.PI) / 180;

export const haversineKm = (a: Project, b: Project) => {
  const R = 6371;
  const dLat = toRad(b.latitude! - a.latitude!);
  const dLon = toRad(b.longitude! - a.longitude!);
  const lat1 = toRad(a.latitude!);
  const lat2 = toRad(b.latitude!);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
};

export const formatDistance = (meters: number) => {
  if (!Number.isFinite(meters) || meters <= 0) return "0 m";

  if (meters >= 1000) {
    const km = meters / 1000;
    return km >= 10 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
  }

  if (meters >= 100) {
    return `${Math.round(meters / 10) * 10} m`;
  }

  return `${Math.round(meters)} m`;
};
