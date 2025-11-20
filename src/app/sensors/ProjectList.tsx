"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BatteryCharging,
  ChevronDown,
  ClipboardPenLine,
  Flame,
  LayoutGrid,
  MapPin,
  Rows,
  Search,
  Sparkles,
  ThermometerSun,
  Waves,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { FireAlert } from "@/types/entities/FireAlerts";
import type { Project } from "@/types/entities/Project";
import { ProjectStatus } from "@/types/enums/ProjectStatus";

import { formatDate, formatRelativeTime, toDate } from "./time";

type SortKey = "activity" | "alerts" | "name" | "installed";

type ProjectListProps = {
  projects: Project[];
  loading: boolean;
  canEdit?: boolean;
  canRequestEdit?: boolean;
  activeAlertsMap?: Map<string, FireAlert[]>;
};

type StatusFilter = ProjectStatus | "all";

type StatusMeta = {
  label: string;
  badgeClass: string;
  textClass: string;
  softBg: string;
};

const STATUS_META: Record<ProjectStatus, StatusMeta> = {
  [ProjectStatus.OK]: {
    label: "Opérationnel",
    badgeClass:
      "border-emerald-500/60 bg-emerald-500/20 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-500/20 dark:text-emerald-200",
    textClass: "text-emerald-600 dark:text-emerald-200",
    softBg: "bg-emerald-500/10",
  },
  [ProjectStatus.WARNING]: {
    label: "Sous surveillance",
    badgeClass:
      "border-amber-500/60 bg-amber-500/20 text-amber-700 dark:border-amber-400/50 dark:bg-amber-500/20 dark:text-amber-200",
    textClass: "text-amber-600 dark:text-amber-200",
    softBg: "bg-amber-500/10",
  },
  [ProjectStatus.FIRE]: {
    label: "Incident critique",
    badgeClass:
      "border-red-500/60 bg-red-500/20 text-red-700 dark:border-red-400/60 dark:bg-red-500/20 dark:text-red-200",
    textClass: "text-red-600 dark:text-red-200",
    softBg: "bg-red-500/10",
  },
  [ProjectStatus.BURNED]: {
    label: "Zone brûlée",
    badgeClass:
      "border-slate-500/40 bg-slate-500/15 text-slate-600 dark:border-slate-500/40 dark:bg-slate-700/40 dark:text-slate-300",
    textClass: "text-slate-500 dark:text-slate-300",
    softBg: "bg-slate-500/10",
  },
  [ProjectStatus.OFFLINE]: {
    label: "Déconnecté",
    badgeClass:
      "border-slate-400/50 bg-slate-400/20 text-slate-600 dark:border-slate-500/40 dark:bg-slate-700/40 dark:text-slate-200",
    textClass: "text-slate-500 dark:text-slate-200",
    softBg: "bg-slate-500/10",
  },
};

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "activity", label: "Activité récente" },
  { value: "alerts", label: "Alertes en cours" },
  { value: "name", label: "Nom A → Z" },
  { value: "installed", label: "Installation la plus récente" },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s]/g, "");

const severityRank: Record<ProjectStatus, number> = {
  [ProjectStatus.FIRE]: 0,
  [ProjectStatus.WARNING]: 1,
  [ProjectStatus.OK]: 2,
  [ProjectStatus.OFFLINE]: 3,
  [ProjectStatus.BURNED]: 4,
};

export default function ProjectList({
  projects,
  loading,
  canEdit,
  canRequestEdit,
  activeAlertsMap,
}: ProjectListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortKey, setSortKey] = useState<SortKey>("activity");

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: projects.length,
      [ProjectStatus.OK]: 0,
      [ProjectStatus.WARNING]: 0,
      [ProjectStatus.FIRE]: 0,
      [ProjectStatus.BURNED]: 0,
      [ProjectStatus.OFFLINE]: 0,
    };

    projects.forEach((project) => {
      counts[project.status] = (counts[project.status] ?? 0) + 1;
    });

    return counts;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = normalize(search);

    let filtered = projects.filter((project) => {
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      const haystack = normalize(
        `${project.name} ${project.manualId ?? ""} ${project.description ?? ""}`
      );

      return haystack.includes(query);
    });

    filtered = [...filtered].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
      }

      if (sortKey === "installed") {
        const aDate = toDate(a.installedAt ?? a.createdAt);
        const bDate = toDate(b.installedAt ?? b.createdAt);
        return (bDate?.getTime() ?? 0) - (aDate?.getTime() ?? 0);
      }

      if (sortKey === "alerts") {
        const aHasAlert = hasActiveFireAlert(activeAlertsMap, a.id);
        const bHasAlert = hasActiveFireAlert(activeAlertsMap, b.id);
        if (aHasAlert !== bHasAlert) {
          return aHasAlert ? -1 : 1;
        }
        return severityRank[a.status] - severityRank[b.status];
      }

      const aDate =
        toDate(a.lastSeenAt) ?? toDate(a.updatedAt) ?? toDate(a.createdAt);
      const bDate =
        toDate(b.lastSeenAt) ?? toDate(b.updatedAt) ?? toDate(b.createdAt);
      return (bDate?.getTime() ?? 0) - (aDate?.getTime() ?? 0);
    });

    return filtered;
  }, [projects, activeAlertsMap, search, sortKey, statusFilter]);

  const hasResults = filteredProjects.length > 0;

  return (
    <section className="space-y-4 sm:space-y-5">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/85 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-800/40 dark:bg-slate-950/80 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              wrapperClassName="w-full"
              className="h-11 rounded-2xl border border-slate-200/70 bg-white/90 pl-9 text-sm shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200/70 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              placeholder="Rechercher un capteur, un site, un ID…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            value={sortKey}
            onValueChange={(value) => setSortKey(value as SortKey)}
          >
            <SelectTrigger className="h-11 w-full rounded-2xl border border-slate-200/70 bg-white/90 px-4 text-sm font-medium text-slate-700 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200/70 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 sm:w-auto sm:min-w-[13rem]">
              Trier ·{" "}
              {SORT_OPTIONS.find((option) => option.value === sortKey)?.label}
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-nowrap sm:items-center">
          <Button
            variant={viewMode === "grid" ? "primary" : "ghost"}
            size="sm"
            startIcon={<LayoutGrid className="h-4 w-4" />}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            className="w-full sm:w-auto"
          >
            Grille
          </Button>
          <Button
            variant={viewMode === "list" ? "primary" : "ghost"}
            size="sm"
            startIcon={<Rows className="h-4 w-4" />}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            className="w-full sm:w-auto"
          >
            Liste
          </Button>
        </div>
      </header>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-2 pl-1 pr-1 sm:flex-wrap sm:overflow-visible">
        {(["all", ...Object.values(ProjectStatus)] as StatusFilter[]).map(
          (status) => {
            const isActive = statusFilter === status;
            const count = statusCounts[status] ?? 0;
            const meta = STATUS_META[status as ProjectStatus];

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200/70 bg-white/80 text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-600",
                  status !== "all" && meta?.softBg
                )}
              >
                <span className="capitalize">
                  {status === "all" ? "Tous" : meta?.label ?? status}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-48 animate-pulse rounded-3xl border border-slate-200/60 bg-slate-100/60 dark:border-slate-800/50 dark:bg-slate-900/60"
            />
          ))}
        </div>
      )}

      {!loading && !hasResults && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
        >
          <Sparkles className="mb-3 h-6 w-6 text-orange-400" />
          <p>Aucun capteur ne correspond à ces filtres pour le moment.</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Ajustez vos filtres ou vérifiez l’orthographe de la recherche.
          </p>
        </motion.div>
      )}

      {!loading && hasResults && (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 2xl:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                viewMode={viewMode}
                canEdit={canEdit}
                canRequestEdit={canRequestEdit}
                alerts={activeAlertsMap?.get(project.id) ?? []}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

type ProjectCardProps = {
  project: Project;
  index: number;
  viewMode: "grid" | "list";
  canEdit?: boolean;
  canRequestEdit?: boolean;
  alerts: FireAlert[];
};

function ProjectCard({
  project,
  index,
  viewMode,
  canEdit,
  canRequestEdit,
  alerts,
}: ProjectCardProps) {
  const [expanded, setExpanded] = useState(viewMode === "list");
  const meta = STATUS_META[project.status];
  const hasActiveFire = alerts.some((alert) => alert.is_fire);
  const latestAlert = alerts
    .map((alert) => toDate(alert.timestamp))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const lastContact =
    formatRelativeTime(
      project.lastSeenAt ?? project.updatedAt ?? project.createdAt
    ) ?? "—";
  const installedOn = formatDate(project.installedAt ?? project.createdAt);

  const temperature = project.lastReading?.temperature;
  const smoke = project.lastReading?.smoke;
  const battery = project.lastReading?.battery;

  const technicians = project.technicianIds.length;
  const firefighters = project.firefighterIds.length;
  const activationTotal =
    typeof project.activationCount === "number"
      ? project.activationCount
      : project.activations?.length ?? 0;

  const cardClasses = cn(
    "relative block overflow-hidden rounded-3xl border border-white/40 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(15,23,42,0.18)] dark:border-slate-800/40 dark:bg-slate-950/85 sm:p-6",
    viewMode === "list" && "w-full"
  );

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <Link href={`/sensors/${project.id}`} className={cardClasses}>
        <div className="flex h-full flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {project.name}
              </h3>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                ID {project.manualId ?? project.id}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                  meta.badgeClass
                )}
              >
                {meta.label}
              </span>
              {hasActiveFire && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-200">
                  <Flame className="h-3.5 w-3.5" /> Alerte feu active
                </span>
              )}
            </div>
          </div>

          {project.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {project.description}
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <QuickStat
              icon={<ThermometerSun className="h-3.5 w-3.5" />}
              label="Température"
              value={
                typeof temperature === "number"
                  ? `${temperature.toFixed(0)}°C`
                  : "n/c"
              }
            />
            <QuickStat
              icon={<BatteryCharging className="h-3.5 w-3.5" />}
              label="Batterie"
              value={typeof battery === "number" ? `${battery}%` : "n/c"}
            />
            <QuickStat
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              label="Activations"
              value={activationTotal}
            />
            <QuickStat
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="Équipe"
              value={`${technicians}/${firefighters}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Dernier contact {lastContact}</span>
            {latestAlert && (
              <span>Dernière alerte {formatRelativeTime(latestAlert)}</span>
            )}
            <span>Installé {installedOn}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 sm:w-auto sm:justify-start"
              aria-expanded={expanded}
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  expanded ? "rotate-180" : "rotate-0"
                )}
              />
              {expanded ? "Masquer les détails" : "Afficher les détails"}
            </button>

            {(canEdit || canRequestEdit) && (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                {canRequestEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    startIcon={<ClipboardPenLine className="h-4 w-4" />}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      notify.info(
                        `Demande de correction envoyée pour ${project.name}.`
                      );
                    }}
                    className="w-full sm:w-auto"
                  >
                    Assistance
                  </Button>
                )}
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      notify.info(
                        "Ouverture du module d’édition prochaine version."
                      );
                    }}
                    className="w-full sm:w-auto"
                  >
                    Configurer
                  </Button>
                )}
              </div>
            )}
          </div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid gap-3 sm:grid-cols-2"
              >
                <InfoPill
                  icon={<MapPin className="h-4 w-4 text-slate-400" />}
                  label="Coordonnées"
                  value={
                    project.latitude && project.longitude
                      ? `${project.latitude.toFixed(
                          3
                        )} · ${project.longitude.toFixed(3)}`
                      : "À confirmer"
                  }
                />
                <InfoPill
                  icon={<Waves className="h-4 w-4 text-sky-500" />}
                  label="Particules"
                  value={typeof smoke === "number" ? `${smoke} ppm` : "n/c"}
                />
                <InfoPill
                  icon={<Flame className="h-4 w-4 text-red-500" />}
                  label="Alertes total"
                  value={alerts.length}
                />
                <InfoPill
                  icon={<Sparkles className="h-4 w-4 text-purple-500" />}
                  label="Techniciens / Pompiers"
                  value={`${technicians} techniciens · ${firefighters} pompiers`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </motion.div>
  );
}

type InfoPillProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

function InfoPill({ icon, label, value }: InfoPillProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/60 bg-white/70 px-3 py-2 text-xs text-slate-500 shadow-sm dark:border-slate-800/50 dark:bg-slate-900/60 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-200">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700 dark:text-white">
        {value}
      </span>
    </div>
  );
}

type QuickStatProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

function QuickStat({ icon, label, value }: QuickStatProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
      <span className="flex min-w-0 items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <span className="ml-auto shrink-0 text-sm font-semibold text-slate-800 dark:text-white">
        {value}
      </span>
    </div>
  );
}

function hasActiveFireAlert(
  map: Map<string, FireAlert[]> | undefined,
  projectId: string
) {
  if (!map) return false;
  return (map.get(projectId) ?? []).some((alert) => alert.is_fire);
}
