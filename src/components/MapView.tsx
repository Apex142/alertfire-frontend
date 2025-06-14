"use client";

import "leaflet/dist/leaflet.css";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

// Fonction Haversine pour la distance
const toRad = (d: number) => (d * Math.PI) / 180;
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

type Role = "master" | "slave";
interface Project {
  uid: string;
  name: string;
  lat: number;
  lng: number;
  role: Role;
  fire: boolean;
  detectedAt?: number;
  ppm: number;
  tempIR: number;
  activationCount: number;
}

const CENTER: [number, number] = [43.232, 5.441];
const rand = () => (Math.random() - 0.5) * 0.0045 * 2;
const now = Date.now();

// 10 projets mock
const projects: Project[] = Array.from({ length: 10 }, (_, i) => {
  const role: Role = i < 3 ? "master" : "slave";
  const fire = Math.random() < 0.3;
  return {
    uid: `uid-${i + 1}`,
    name: `${role.charAt(0).toUpperCase() + role.slice(1)}-${i + 1}`,
    lat: CENTER[0] + rand(),
    lng: CENTER[1] + rand(),
    role,
    fire,
    detectedAt: fire ? now - Math.floor(Math.random() * 3600000) : undefined,
    ppm: Math.floor(Math.random() * 400 + 200),
    tempIR: parseFloat((Math.random() * 30 + 20).toFixed(1)),
    activationCount: Math.ceil(Math.random() * 5),
  };
});

// Propagation
const fireNodes = projects
  .filter((p) => p.fire && p.detectedAt)
  .sort((a, b) => (a.detectedAt! < b.detectedAt! ? -1 : 1));
const propagationLinks = fireNodes
  .slice(1)
  .map((dst, i) => [fireNodes[i], dst]);

export default function MapView() {
  return (
    <>
      <MapContainer
        center={CENTER}
        zoom={16}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        {/* Marqueurs des projets */}
        {projects.map((p) => (
          <CircleMarker
            key={p.uid}
            center={[p.lat, p.lng]}
            radius={8}
            pathOptions={{
              color: p.role === "master" ? "#2563eb" : "#16a34a",
              fillColor: p.role === "master" ? "#2563eb" : "#16a34a",
              fillOpacity: 1,
              className: p.fire ? "fire-blink" : "",
            }}
          >
            <Popup>
              <strong>{p.name}</strong> ({p.role})
              <br />
              UID : {p.uid}
              <br />
              Lat/Lng : {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
              <br />
              Adresse : 1320 Route des Milles, Luminy (mock)
              <br />
              CO₂ : {p.ppm} ppm
              <br />
              Température IR : {p.tempIR} °C
              <br />
              Activations : {p.activationCount}
              <br />
              {p.fire && (
                <>🔥 Détecté : {new Date(p.detectedAt!).toLocaleString()}</>
              )}
            </Popup>
          </CircleMarker>
        ))}

        {/* Halo rouge clignotant */}
        {projects.map(
          (p) =>
            p.fire && (
              <Circle
                key={p.uid + "-halo"}
                center={[p.lat, p.lng]}
                radius={35}
                interactive={false}
                pathOptions={{
                  color: "#991b1b",
                  fillColor: "#991b1b",
                  fillOpacity: 0.25,
                  weight: 2,
                  className: "fire-halo",
                }}
              />
            )
        )}

        {/* Lignes propagation + zones */}
        {propagationLinks.map(([a, b], idx) => {
          const midLat = (a.lat + b.lat) / 2;
          const midLng = (a.lng + b.lng) / 2;
          const dist = haversine(a.lat, a.lng, b.lat, b.lng);
          const radius = dist / 2 + 30;

          return (
            <div key={`link-${a.uid}-${b.uid}`}>
              <Polyline
                positions={[
                  [a.lat, a.lng],
                  [b.lat, b.lng],
                ]}
                pathOptions={{
                  color: "#dc2626",
                  weight: 4,
                  dashArray: "6 6",
                }}
              />
              <Circle
                center={[midLat, midLng]}
                radius={radius}
                interactive={false}
                pathOptions={{
                  color: "#ef4444",
                  fillColor: "#f87171",
                  fillOpacity: 0.2,
                }}
              />
            </div>
          );
        })}
      </MapContainer>

      {/* Animations globales */}
      <style jsx global>{`
        @keyframes fire-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.2;
          }
        }

        .leaflet-interactive.fire-blink {
          animation: fire-blink 0.9s infinite;
        }

        .leaflet-interactive.fire-halo {
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
