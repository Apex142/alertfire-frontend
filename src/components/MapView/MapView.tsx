"use client";

import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useMemo, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import { useFireAlerts } from "@/hooks/useFireAlerts";
import { useProjects } from "@/hooks/useProjects";
import { usePropagation } from "@/hooks/usePropagations";
import type { FireAlert } from "@/types/entities/FireAlerts";
import type { Project } from "@/types/entities/Project";
import type { PropagationPrediction } from "@/types/entities/PropagationPrediction";
import { haversineKm } from "@/utils/geo";

import { MapLayersProvider, useMapLayers } from "../MapLayersContext";
import {
  LayerFilterOption,
  LayerTogglePanel,
  TimeRangeOption,
} from "../controls/LayerTogglePanel";
import { FireHaloLayer } from "../layers/FireHaloLayer";
import { ProjectsLayer } from "../layers/ProjectsLayer";
import { PropagationLinesLayer } from "../layers/PropagationLinesLayer";
import { RangeCirclesLayer } from "../layers/RangeCirclesLayer";
import { ThreatenedLayer } from "../layers/ThreatenedLayer";

const FALLBACK_CENTER: [number, number] = [43.2306, 5.4576];

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 12, label: "12 h" },
  { value: 24, label: "24 h" },
  { value: 48, label: "48 h" },
  { value: 72, label: "72 h" },
];

type SeverityLevel = "critical" | "high" | "moderate" | "watch";

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  critical: "Critique",
  high: "Élevée",
  moderate: "Modérée",
  watch: "Surveillance",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sans-categorie";

const resolveProjectCategory = (project: Project) => {
  const candidate =
    (project as unknown as { category?: string }).category ??
    (project as unknown as { metadata?: { category?: string } }).metadata
      ?.category ??
    project.ownerCompanyId ??
    (project.isMaster ? "Site maître" : undefined);

  const label =
    typeof candidate === "string" && candidate.trim().length > 0
      ? candidate.trim()
      : "Sans catégorie";

  return { slug: slugify(label), label };
};

const alertTimestampMs = (alert: FireAlert) => {
  const timestamp = alert.timestamp as unknown;
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp.getTime();
  if (typeof timestamp === "number") return timestamp;
  if (typeof timestamp === "string") {
    const parsed = Date.parse(timestamp);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof (timestamp as { toDate?: () => Date }).toDate === "function") {
    return (timestamp as { toDate: () => Date }).toDate().getTime();
  }
  return null;
};

const classifySeverity = (alert: FireAlert): SeverityLevel => {
  const temperature = alert.temperature ?? 0;
  const co2 = alert.co2_level ?? 0;
  const confidence = alert.confidence ?? 0;

  if (alert.is_fire) {
    if (temperature >= 80 || co2 >= 450 || confidence >= 0.92) {
      return "critical";
    }
    if (temperature >= 65 || co2 >= 380 || confidence >= 0.75) {
      return "high";
    }
    return "moderate";
  }

  if (temperature >= 55 || confidence >= 0.6) {
    return "moderate";
  }

  return "watch";
};

export default function MapView() {
  return (
    <MapLayersProvider>
      <MapViewContent />
    </MapLayersProvider>
  );
}

function MapViewContent() {
  const mapRef = useRef<L.Map | null>(null);
  const { filters } = useMapLayers();

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const {
    alerts,
    loading: alertsLoading,
    error: alertsError,
  } = useFireAlerts();

  const geoProjects = useMemo(
    () => projects.filter((project) => project.latitude && project.longitude),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    if (filters.projectCategory === "all") return geoProjects;
    return geoProjects.filter(
      (project) =>
        resolveProjectCategory(project).slug === filters.projectCategory
    );
  }, [geoProjects, filters.projectCategory]);

  const filteredProjectMap = useMemo(
    () => new Map(filteredProjects.map((project) => [project.id, project])),
    [filteredProjects]
  );

  const categoryOptions = useMemo<LayerFilterOption[]>(() => {
    const map = new Map<string, { label: string; count: number }>();

    geoProjects.forEach((project) => {
      const { slug, label } = resolveProjectCategory(project);
      const entry = map.get(slug);
      if (entry) {
        entry.count += 1;
      } else {
        map.set(slug, { label, count: 1 });
      }
    });

    const sorted = Array.from(map.entries()).sort((a, b) =>
      a[1].label.localeCompare(b[1].label, "fr", { sensitivity: "base" })
    );

    return [
      {
        value: "all",
        label: "Tous les sites",
        count: geoProjects.length,
      },
      ...sorted.map(([value, info]) => ({
        value,
        label: info.label,
        count: info.count,
      })),
    ];
  }, [geoProjects]);

  const categoryProjectIds = useMemo(() => {
    if (filters.projectCategory === "all") return null;
    const ids = new Set<string>();
    projects.forEach((project) => {
      const { slug } = resolveProjectCategory(project);
      if (slug === filters.projectCategory) {
        ids.add(project.id);
      }
    });
    return ids;
  }, [projects, filters.projectCategory]);

  const alertsWithinWindow = useMemo(() => {
    if (filters.timeRange <= 0) return alerts;
    const cutoff = Date.now() - filters.timeRange * 60 * 60 * 1000;
    return alerts.filter((alert) => {
      const timestamp = alertTimestampMs(alert);
      return timestamp === null || timestamp >= cutoff;
    });
  }, [alerts, filters.timeRange]);

  const severityOptions = useMemo<LayerFilterOption[]>(() => {
    const counts: Record<SeverityLevel, number> = {
      critical: 0,
      high: 0,
      moderate: 0,
      watch: 0,
    };

    alertsWithinWindow.forEach((alert) => {
      const severity = classifySeverity(alert);
      counts[severity] += 1;
    });

    const total = alertsWithinWindow.length;

    return [
      {
        value: "all",
        label: "Toutes les sévérités",
        count: total,
      },
      ...(["critical", "high", "moderate", "watch"] as SeverityLevel[]).map(
        (key) => ({
          value: key,
          label: SEVERITY_LABELS[key],
          count: counts[key],
        })
      ),
    ];
  }, [alertsWithinWindow]);

  const alertsAfterSeverity = useMemo(() => {
    if (filters.alertSeverity === "all") return alertsWithinWindow;
    return alertsWithinWindow.filter(
      (alert) => classifySeverity(alert) === filters.alertSeverity
    );
  }, [alertsWithinWindow, filters.alertSeverity]);

  const filteredAlerts = useMemo(() => {
    if (!categoryProjectIds) return alertsAfterSeverity;
    return alertsAfterSeverity.filter((alert) =>
      categoryProjectIds.has(alert.project_id)
    );
  }, [alertsAfterSeverity, categoryProjectIds]);

  const filteredActiveProjectIds = useMemo(
    () =>
      new Set(
        filteredAlerts
          .filter((alert) => alert.is_fire)
          .map((alert) => alert.project_id)
      ),
    [filteredAlerts]
  );

  const horizonHours = Math.max(filters.timeRange, 1);

  const {
    propagations,
    loading: propagationLoading,
    error: propagationError,
    refresh: refreshPropagation,
  } = usePropagation(filteredActiveProjectIds, horizonHours);

  const filteredPropagations = useMemo(() => {
    const allowedIds = new Set(filteredProjects.map((project) => project.id));
    const next: Record<string, PropagationPrediction[]> = {};

    Object.entries(propagations).forEach(([originId, predictions]) => {
      if (!allowedIds.has(originId)) return;
      next[originId] = predictions.filter((prediction) =>
        allowedIds.has(prediction.node_id)
      );
    });

    return next;
  }, [propagations, filteredProjects]);

  const fires = useMemo(
    () =>
      filteredProjects.filter(
        (project) =>
          filteredActiveProjectIds.has(project.id) && project.status === "fire"
      ),
    [filteredProjects, filteredActiveProjectIds]
  );

  const fireIds = useMemo(
    () => new Set(fires.map((fireProject) => fireProject.id)),
    [fires]
  );

  const threatened = useMemo(() => {
    const threatenedIds = new Set<string>();
    Object.values(filteredPropagations).forEach((predictions) =>
      predictions.forEach((prediction) => {
        if (prediction.will_reach) {
          threatenedIds.add(prediction.node_id);
        }
      })
    );

    return filteredProjects.filter(
      (project) => threatenedIds.has(project.id) && !fireIds.has(project.id)
    );
  }, [filteredPropagations, filteredProjects, fireIds]);

  const { links, circles } = useMemo(() => {
    const ln: { origin: Project; target: Project }[] = [];
    const cir: { center: Project; radiusM: number }[] = [];

    fires.forEach((origin) => {
      (filteredPropagations[origin.id] ?? [])
        .filter((prediction) => prediction.will_reach)
        .forEach((prediction) => {
          const target = filteredProjectMap.get(prediction.node_id);
          if (!target) return;
          ln.push({ origin, target });
          cir.push({
            center: origin,
            radiusM: haversineKm(origin, target) * 1000,
          });
        });
    });

    return { links: ln, circles: cir };
  }, [fires, filteredPropagations, filteredProjectMap]);

  const center = useMemo<[number, number]>(() => {
    const candidates =
      filteredProjects.length > 0 ? filteredProjects : geoProjects;
    if (
      candidates.length > 0 &&
      candidates[0].latitude !== undefined &&
      candidates[0].longitude !== undefined
    ) {
      return [candidates[0].latitude!, candidates[0].longitude!];
    }
    return FALLBACK_CENTER;
  }, [filteredProjects, geoProjects]);

  const timeOptions = useMemo<TimeRangeOption[]>(() => {
    if (
      TIME_RANGE_OPTIONS.some((option) => option.value === filters.timeRange)
    ) {
      return TIME_RANGE_OPTIONS;
    }
    return [
      ...TIME_RANGE_OPTIONS,
      {
        value: filters.timeRange,
        label: `${filters.timeRange} h`,
      },
    ];
  }, [filters.timeRange]);

  const isLoading = projectsLoading || alertsLoading || propagationLoading;

  const loadingMessage = useMemo(() => {
    if (projectsLoading) return "Synchronisation des sites terrain…";
    if (alertsLoading) return "Récupération des foyers actifs…";
    if (propagationLoading) return "Calcul des scénarios de propagation…";
    return "Mise à jour des données…";
  }, [projectsLoading, alertsLoading, propagationLoading]);

  const errorCard = useMemo(() => {
    if (propagationError) {
      return {
        headline: "Propagation indisponible",
        detail:
          propagationError.message ?? "Impossible de calculer la propagation.",
        canRetry: true,
      } as const;
    }
    if (alertsError) {
      return {
        headline: "Impossible de charger les alertes",
        detail:
          alertsError.message ??
          "Erreur inattendue lors de la récupération des alertes.",
        canRetry: false,
      } as const;
    }
    if (projectsError) {
      return {
        headline: "Chargement des sites échoué",
        detail:
          projectsError.message ??
          "Erreur inattendue lors du chargement des sites.",
        canRetry: false,
      } as const;
    }
    return null;
  }, [propagationError, alertsError, projectsError]);

  return (
    <>
      <div className="relative h-full w-full">
        <LayerTogglePanel
          categoryOptions={categoryOptions}
          severityOptions={severityOptions}
          timeOptions={timeOptions}
        />

        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="map-loader"
              className="pointer-events-auto absolute inset-0 z-[1300] flex items-center justify-center overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.65),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.85),_transparent_70%)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
              <motion.span
                className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full bg-amber-400/25 blur-[120px] dark:bg-orange-500/20"
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  opacity: [0.35, 0.55, 0.35],
                }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.span
                className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-sky-400/30 blur-[140px] dark:bg-sky-500/25"
                animate={{
                  scale: [0.85, 1.05, 0.85],
                  opacity: [0.28, 0.5, 0.28],
                }}
                transition={{
                  duration: 5.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="relative z-10 flex w-[min(24rem,92vw)] flex-col items-center gap-5 rounded-3xl border border-white/40 bg-white/85 px-7 py-7 text-center shadow-[0_25px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-900/82 dark:shadow-[0_25px_60px_rgba(2,6,23,0.55)]"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 18, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <motion.span
                    className="absolute inset-0 rounded-full border border-dashed border-amber-400/50 dark:border-amber-500/30"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.span
                    className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-400/40 via-orange-500/25 to-rose-500/30 dark:from-amber-500/30 dark:via-orange-500/25 dark:to-rose-500/30"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <Loader2 className="relative h-10 w-10 animate-spin text-amber-500 dark:text-amber-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {loadingMessage}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Analyse des foyers, des capteurs et des trajectoires
                    probables…
                  </p>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800">
                  <motion.span
                    className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 dark:from-amber-400 dark:via-orange-500 dark:to-rose-400"
                    animate={{
                      x: ["-60%", "120%", "120%"],
                      opacity: [0.2, 1, 0.2],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {errorCard && !isLoading && (
            <motion.div
              key="map-error"
              className="pointer-events-auto absolute bottom-6 left-1/2 z-[1250] w-[min(26rem,92vw)] -translate-x-1/2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <div className="flex items-start gap-3 rounded-2xl border border-red-200/60 bg-white/85 p-4 shadow-xl backdrop-blur dark:border-red-500/30 dark:bg-slate-900/85">
                <span className="mt-0.5 rounded-full bg-red-500/15 p-2 text-red-500 dark:bg-red-500/20 dark:text-red-300">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="flex-1 space-y-1 text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {errorCard.headline}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {errorCard.detail}
                  </p>
                </div>
                {errorCard.canRetry && (
                  <button
                    onClick={refreshPropagation}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200/70 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-500/15 dark:border-red-500/40 dark:text-red-300"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Relancer
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom
          className="map-full"
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />

          <ProjectsLayer
            projects={filteredProjects}
            activeProjectIds={filteredActiveProjectIds}
            propagations={filteredPropagations}
          />
          <FireHaloLayer fires={fires} />
          <ThreatenedLayer projects={threatened} />
          <PropagationLinesLayer links={links} />
          <RangeCirclesLayer circles={circles} />
        </MapContainer>
      </div>

      <style jsx global>{`
        .map-full {
          width: 100%;
          height: 100dvh;
          min-height: 100dvh;
        }

        @media (min-width: 768px) {
          .map-full {
            height: calc(100dvh - 4rem);
            min-height: calc(100dvh - 4rem);
          }
        }

        @media (max-width: 767px) {
          .map-full {
            height: calc(100dvh - 7rem);
            min-height: calc(100dvh - 7rem);
          }
        }

        @keyframes fire-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.25;
          }
        }
        .leaflet-interactive.fire-blink {
          animation: fire-blink 1s infinite;
        }

        .range-circle-halo {
          animation: range-glow 6s ease-in-out infinite;
        }
        .range-circle-ring {
          animation: range-pulse 3.2s ease-in-out infinite;
        }

        .propagation-line {
          animation: propagation-flow 3s linear infinite;
        }

        .threatened-zone-halo {
          animation: threat-glow 5.2s ease-in-out infinite;
        }
        .threatened-zone-ring {
          animation: threat-pulse 2.8s ease-in-out infinite;
        }

        .fire-halo-wave {
          animation: fire-wave 3.4s ease-in-out infinite;
        }
        .fire-halo-core {
          animation: fire-core 1.6s ease-in-out infinite;
        }

        .leaflet-tooltip.range-tooltip,
        .leaflet-tooltip.propagation-tooltip,
        .leaflet-tooltip.threat-tooltip,
        .leaflet-tooltip.fire-tooltip {
          background: rgba(15, 23, 42, 0.85);
          color: #f8fafc;
          border: none;
          border-radius: 0.6rem;
          padding: 0.45rem 0.65rem;
          box-shadow: 0 12px 25px rgba(15, 23, 42, 0.45);
          pointer-events: none;
        }

        .leaflet-tooltip.range-tooltip {
          border-left: 3px solid #fb923c;
        }
        .leaflet-tooltip.propagation-tooltip {
          border-left: 3px solid #f97316;
        }
        .leaflet-tooltip.threat-tooltip {
          border-left: 3px solid #f43f5e;
        }
        .leaflet-tooltip.fire-tooltip {
          border-left: 3px solid #ef4444;
        }

        .leaflet-pane.leaflet-tooltip-pane {
          z-index: 1200 !important;
        }

        @keyframes range-glow {
          0%,
          100% {
            opacity: 0.18;
          }
          50% {
            opacity: 0.32;
          }
        }

        @keyframes range-pulse {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.82;
          }
          50% {
            stroke-dashoffset: -28;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: -56;
            opacity: 0.82;
          }
        }

        @keyframes propagation-flow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -140;
          }
        }

        @keyframes threat-glow {
          0%,
          100% {
            opacity: 0.18;
          }
          50% {
            opacity: 0.36;
          }
        }

        @keyframes threat-pulse {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.72;
          }
          50% {
            stroke-dashoffset: -20;
            opacity: 0.95;
          }
          100% {
            stroke-dashoffset: -40;
            opacity: 0.72;
          }
        }

        @keyframes fire-core {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes fire-wave {
          0%,
          100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
