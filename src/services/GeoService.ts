import { Coordinates } from "@/types/enums/Coordinates";

/** Haversine distance mètres */
export const distanceMeters = (a: Coordinates, b: Coordinates): number => {
  const R = 6371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const l1 = toRad(a.lat);
  const l2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(l1) * Math.cos(l2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
