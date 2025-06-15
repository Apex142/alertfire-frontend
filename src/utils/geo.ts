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
