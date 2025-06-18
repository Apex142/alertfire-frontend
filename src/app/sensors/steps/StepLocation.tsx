"use client";

import { useProjectWizard } from "@/hooks/useProjectWizard";
import { motion } from "framer-motion";
import { DivIcon, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

// Marqueur maison en SVG via DivIcon
const customIcon = new DivIcon({
  html: `
    <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg" class="lucide lucide-map-pin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:20px; height:20px; color:#dc2626;">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function Click({ onSelect }: { onSelect: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

export default function StepLocation({
  data,
  update,
}: ReturnType<typeof useProjectWizard>) {
  useEffect(() => {
    if (!data.latitude) {
      navigator.geolocation.getCurrentPosition((pos) =>
        update({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
      );
    }
  }, [data.latitude, update]);

  const center = data.latitude ? [data.latitude, data.longitude!] : [46.8, 2.6];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <MapContainer
          center={center as [number, number]}
          zoom={13}
          className="h-64 rounded-xl border border-border shadow-sm"
          scrollWheelZoom
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Click
            onSelect={(p) => update({ latitude: p.lat, longitude: p.lng })}
          />
          {data.latitude && (
            <Marker
              position={[data.latitude, data.longitude!] as [number, number]}
              icon={customIcon}
            />
          )}
        </MapContainer>
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur px-3 py-1 rounded text-xs text-muted-foreground shadow">
          Cliquez sur la carte pour définir la position
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Latitude
          </label>
          <div className="relative">
            <input
              readOnly
              value={data.latitude ?? ""}
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground cursor-not-allowed"
            />
            <MapPin className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Longitude
          </label>
          <div className="relative">
            <input
              readOnly
              value={data.longitude ?? ""}
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground cursor-not-allowed"
            />
            <MapPin className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Altitude (m)
          </label>
          <input
            type="number"
            value={data.altitude ?? ""}
            onChange={(e) => update({ altitude: +e.target.value || undefined })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Ex : 152"
          />
        </div>
      </div>
    </motion.div>
  );
}
