"use client";

import { Card } from "@/components/ui/Card";
import { useFireAlerts } from "@/hooks/useFireAlerts";
import { useProjects } from "@/hooks/useProjects";
import {
  CalendarClock,
  Flame,
  GaugeCircle,
  MapPin,
  SignalHigh,
  Thermometer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function AlertsPage() {
  const router = useRouter();

  /* données temps réel */
  const { alerts, loading: alertsLoading } = useFireAlerts();
  const { projects, loading: projLoading, error } = useProjects();

  /* index projet → coordonnées */
  const projectMap = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number }>();
    projects.forEach((p) => {
      if (typeof p.latitude === "number" && typeof p.longitude === "number") {
        map.set(p.id, { lat: p.latitude, lng: p.longitude });
      }
    });
    return map;
  }, [projects]);

  /* alertes actives triées */
  const activeAlerts = useMemo(
    () =>
      alerts
        .filter((a) => a.is_fire)
        .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()),
    [alerts]
  );

  /* états de chargement / erreur */
  if (alertsLoading || projLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Chargement des alertes…
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        Erreur : {error.message}
      </div>
    );
  }
  if (activeAlerts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Aucune alerte active détectée.
      </div>
    );
  }

  /* rendu */
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flame className="text-red-600" />
          Alertes de feu actives
        </h1>
        <p className="text-sm text-muted-foreground">
          {activeAlerts.length} alerte
          {activeAlerts.length > 1 ? "s" : ""} en cours de traitement.
        </p>
      </header>

      <section className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {activeAlerts.map((alert) => {
          const coords = projectMap.get(alert.project_id);
          return (
            <Card
              key={alert.id}
              onClick={() => router.push(`/sensors/${alert.project_id}`)}
              className="relative cursor-pointer border-l-4 border-red-600 bg-background hover:shadow-md transition p-5"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    <Flame size={18} />
                    Détection de feu
                  </h2>

                  <dl className="grid grid-cols-[20px_auto] gap-x-3 gap-y-1 text-sm text-muted-foreground mt-2">
                    <dt>
                      <MapPin size={16} />
                    </dt>
                    <dd>
                      {coords
                        ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                        : "—"}
                    </dd>

                    <dt>
                      <Thermometer size={16} />
                    </dt>
                    <dd>{alert.temperature.toFixed(1)} °C</dd>

                    <dt>
                      <SignalHigh size={16} />
                    </dt>
                    <dd>{alert.co2_level.toFixed(0)} ppm CO₂</dd>

                    <dt>
                      <GaugeCircle size={16} />
                    </dt>
                    <dd>{Math.round(alert.confidence * 100)} % de confiance</dd>

                    <dt>
                      <CalendarClock size={16} />
                    </dt>
                    <dd>
                      {new Date(alert.timestamp.toMillis()).toLocaleString()}
                    </dd>
                  </dl>
                </div>

                <code className="text-xs text-muted-foreground absolute top-3 right-4">
                  {alert.id.slice(0, 8)}…
                </code>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Projet associé :{" "}
                <span className="font-semibold text-foreground">
                  {alert.project_id}
                </span>
              </div>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
