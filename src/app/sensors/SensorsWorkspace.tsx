"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BatteryCharging,
  Flame,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  SignalHigh,
} from "lucide-react";

import AddProjectWizard from "@/components/projects/AddProjectWizard";
import { Button } from "@/components/ui/Button";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { Card } from "@/components/ui/Card";
import { useFireAlerts } from "@/hooks/useFireAlerts";
import { useProjects } from "@/hooks/useProjects";
import type { Project } from "@/types/entities/Project";
import type { FireAlert } from "@/types/entities/FireAlerts";
import { ProjectStatus } from "@/types/enums/ProjectStatus";

import ProjectList from "./ProjectList";
import { formatDateTime, formatRelativeTime, toDate } from "./time";

const MODE_COPY: Record<
  "admin" | "technician" | "firefighter",
  {
    headline: string;
    kicker: string;
    description: string;
    cta?: string;
    secondaryCta?: string;
    allowCreation: boolean;
  }
> = {
  admin: {
    headline: "Centre de pilotage capteurs",
    kicker: "Supervision globale",
    description:
      "Synchronisez installations, incidents et maintenance préventive depuis une interface unifiée.",
    cta: "Déployer un capteur",
    secondaryCta: "Actualiser",
    allowCreation: true,
  },
  technician: {
    headline: "Maintenance terrain",
    kicker: "Techniciens AlertFire",
    description:
      "Visualisez vos sites, planifiez les interventions et suivez l’activité des équipements en continu.",
    cta: "Nouvelle installation",
    secondaryCta: "Actualiser",
    allowCreation: true,
  },
  firefighter: {
    headline: "Surveillance opérationnelle",
    kicker: "Pompiers & officier de garde",
    description:
      "Consultez l’état des capteurs critiques, les alertes en cours et les récentes activations sur votre territoire.",
    secondaryCta: "Actualiser",
    allowCreation: false,
  },
};

const STATUS_ORDER: ProjectStatus[] = [
  ProjectStatus.FIRE,
  ProjectStatus.WARNING,
  ProjectStatus.OK,
  ProjectStatus.OFFLINE,
  ProjectStatus.BURNED,
];

const statusPalette: Record<ProjectStatus, string> = {
  [ProjectStatus.OK]: "bg-emerald-500",
  [ProjectStatus.WARNING]: "bg-amber-500",
  [ProjectStatus.FIRE]: "bg-red-500",
  [ProjectStatus.BURNED]: "bg-slate-500",
  [ProjectStatus.OFFLINE]: "bg-slate-400",
};

const statusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.OK]: "Opérationnel",
  [ProjectStatus.WARNING]: "Sous surveillance",
  [ProjectStatus.FIRE]: "Incident critique",
  [ProjectStatus.BURNED]: "Zone brûlée",
  [ProjectStatus.OFFLINE]: "Déconnecté",
};

type SensorsWorkspaceProps = {
  mode: "admin" | "technician" | "firefighter";
};

type ActivationEvent = {
  project: Project;
  at: Date;
  activationId: string;
  temperature?: number;
  smoke?: number;
  battery?: number;
};

export default function SensorsWorkspace({ mode }: SensorsWorkspaceProps) {
  const copy = MODE_COPY[mode];
  const [wizardOpen, setWizardOpen] = useState(false);

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    refresh,
  } = useProjects();

  const {
    alerts,
    loading: alertsLoading,
    error: alertsError,
  } = useFireAlerts();

  const isInitialLoading = projectsLoading && projects.length === 0;
  const isSyncing = projectsLoading || alertsLoading;

  const activeAlertsByProject = useMemo(() => {
    const map = new Map<string, FireAlert[]>();
    alerts.forEach((alert) => {
      const current = map.get(alert.project_id) ?? [];
      current.push(alert);
      map.set(alert.project_id, current);
    });
    return map;
  }, [alerts]);

  const stats = useMemo(() => {
    const total = projects.length;

    const critical = projects.filter((project) => project.status === ProjectStatus.FIRE).length;
    const warning = projects.filter((project) => project.status === ProjectStatus.WARNING).length;
    const connected = projects.filter(
      (project) =>
        project.status !== ProjectStatus.OFFLINE &&
        project.status !== ProjectStatus.BURNED
    ).length;
    const offline = projects.filter((project) => project.status === ProjectStatus.OFFLINE).length;

    const technicianCount = new Set(projects.flatMap((project) => project.technicianIds)).size;
    const firefighterCount = new Set(projects.flatMap((project) => project.firefighterIds)).size;

    const batteryValues = projects
      .map((project) => project.lastReading?.battery)
      .filter((value): value is number => typeof value === "number");
    const averageBattery = batteryValues.length
      ? Math.round(
          batteryValues.reduce((acc, value) => acc + value, 0) / batteryValues.length
        )
      : null;

    const latestActivityDate = projects
      .map((project) => toDate(project.lastSeenAt ?? project.updatedAt ?? project.createdAt))
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    const activeIncidents = alerts.filter((alert) => alert.is_fire).length;

    return {
      total,
      critical,
      warning,
      connected,
      offline,
      averageBattery,
      technicianCount,
      firefighterCount,
      latestActivityDate,
      activeIncidents,
    };
  }, [alerts, projects]);

  const statusDistribution = useMemo(() => {
    const totals = new Map<ProjectStatus, number>();
    STATUS_ORDER.forEach((status) => totals.set(status, 0));
    projects.forEach((project) => {
      totals.set(project.status, (totals.get(project.status) ?? 0) + 1);
    });
    return totals;
  }, [projects]);

  const recentActivations = useMemo<ActivationEvent[]>(() => {
    const events: ActivationEvent[] = [];

    projects.forEach((project) => {
      const activations = project.activations ?? [];

      activations
        .slice(Math.max(activations.length - 5, 0))
        .forEach((activation) => {
          const date = toDate(activation.at);
          if (!date) return;
          events.push({
            project,
            at: date,
            activationId: activation.id,
            temperature: activation.reading?.temperature,
            smoke: activation.reading?.smoke,
            battery: activation.reading?.battery,
          });
        });
    });

    return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 6);
  }, [projects]);

  if (isInitialLoading) {
    return <BrandLoader message="Chargement des capteurs et incidents en direct" />;
  }

  const showCreateButton = copy.allowCreation;

    return (
      <main className="mx-auto max-w-7xl space-y-9 px-3 py-8 sm:px-6 sm:py-12">
      <section className="overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-orange-500/85 via-rose-500/80 to-violet-600/80 p-[1px] shadow-[0_35px_120px_rgba(15,23,42,0.35)] dark:border-slate-800/60">
        <div className="h-full w-full rounded-[calc(1.5rem-1px)] bg-white/90 p-6 backdrop-blur dark:bg-slate-950/85 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/90 dark:bg-white/90 dark:text-slate-900/90">
                {copy.kicker}
              </span>
              <motion.h1
                layoutId="sensors-headline"
                className="text-3xl font-semibold leading-tight text-slate-900 dark:text-white md:text-4xl"
              >
                {copy.headline}
              </motion.h1>
              <p className="text-sm text-slate-700 dark:text-slate-300 md:text-base">
                {copy.description}
              </p>
              {stats.latestActivityDate && (
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Mise à jour {formatRelativeTime(stats.latestActivityDate)}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {copy.secondaryCta && (
                <Button
                  variant="outline"
                  startIcon={<RefreshCw className="h-4 w-4" />}
                  onClick={refresh}
                  loading={projectsLoading}
                  className="backdrop-blur"
                >
                  {copy.secondaryCta}
                </Button>
              )}
              {showCreateButton && copy.cta && (
                <Button
                  startIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setWizardOpen(true)}
                  className="bg-slate-900 text-white shadow-[0_20px_45px_rgba(15,23,42,0.35)] transition hover:shadow-[0_25px_60px_rgba(15,23,42,0.45)] dark:bg-white dark:text-slate-900"
                >
                  {copy.cta}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Capteurs suivis"
              value={stats.total}
              hint={`${stats.connected} connectés / ${stats.offline} déconnectés`}
            />
            <MetricCard
              icon={<Flame className="h-5 w-5 text-red-500" />}
              label="Incidents actifs"
              value={stats.activeIncidents}
              tone="warning"
              hint={
                stats.critical > 0
                  ? `${stats.critical} sites en feu`
                  : stats.warning > 0
                  ? `${stats.warning} sous surveillance`
                  : "Aucun incident critique"
              }
            />
            <MetricCard
              icon={<SignalHigh className="h-5 w-5 text-emerald-500" />}
              label="Disponibilité"
              value={stats.total === 0 ? "—" : `${Math.round((stats.connected / stats.total) * 100)} %`}
              hint="Taux de capteurs opérationnels"
            />
            <MetricCard
              icon={<BatteryCharging className="h-5 w-5 text-sky-500" />}
              label="Batterie moyenne"
              value={stats.averageBattery !== null ? `${stats.averageBattery} %` : "—"}
              hint={`${stats.technicianCount} techniciens · ${stats.firefighterCount} pompiers`}
            />
          </div>
        </div>
      </section>

      {(projectsError || alertsError) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
        >
          {projectsError?.message || alertsError?.message || "Une erreur est survenue lors du chargement des données."}
        </motion.div>
      )}

  <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <ProjectList
          projects={projects}
          loading={projects.length === 0 && isSyncing}
          canEdit={mode !== "firefighter"}
          canRequestEdit={mode === "firefighter"}
          activeAlertsMap={activeAlertsByProject}
        />

        <div className="space-y-6">
          <Card className="pointer-events-auto flex flex-col gap-4 rounded-3xl border border-white/40 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.15)] backdrop-blur dark:border-slate-800/40 dark:bg-slate-950/80 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Distribution des statuts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vue instantanée de la santé du parc déployé.
                </p>
              </div>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {STATUS_ORDER.map((status) => {
                const count = statusDistribution.get(status) ?? 0;
                const total = stats.total || 1;
                const ratio = Math.round((count / total) * 100);

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${statusPalette[status]}`} />
                        {statusLabels[status]}
                      </span>
                      <span>{count} · {ratio}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/70">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(ratio, count > 0 ? 6 : 0)}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-full ${statusPalette[status]} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="pointer-events-auto flex h-full flex-col gap-4 rounded-3xl border border-white/40 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.15)] backdrop-blur dark:border-slate-800/40 dark:bg-slate-950/80 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Activité récente
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dernières activations signalées par le réseau de capteurs.
                </p>
              </div>
              <MapPin className="h-4 w-4 text-slate-400" />
            </div>
            <div className="relative mt-2 flex-1">
              <div className="absolute left-[9px] top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-200/60 to-transparent dark:from-slate-700 dark:via-slate-700/40" />
              <ul className="space-y-4">
                <AnimatePresence mode="sync">
                  {recentActivations.length === 0 && (
                    <motion.li
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative pl-6 text-xs text-slate-500 dark:text-slate-400"
                    >
                      Aucune activation récente pour le moment.
                    </motion.li>
                  )}
                  {recentActivations.map((event) => (
                    <motion.li
                      key={event.activationId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="relative pl-6"
                    >
                      <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-orange-500 shadow-sm dark:border-slate-900" />
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {event.project.name}
                        </span>
                        <span>{formatRelativeTime(event.at)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(event.at)} · {typeof event.temperature === "number" ? `${event.temperature.toFixed(1)}°C` : "Température n/c"} · {typeof event.smoke === "number" ? `${event.smoke} ppm` : "Fumées n/c"}
                      </p>
                      {typeof event.battery === "number" && (
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                          Batterie {event.battery}%
                        </p>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      <AddProjectWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </main>
  );
}

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  tone?: "default" | "warning";
};

function MetricCard({ icon, label, value, hint, tone = "default" }: MetricCardProps) {
  const toneClasses =
    tone === "warning"
      ? "border-red-200/60 bg-red-50/80 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
      : "border-slate-200/70 bg-white/80 text-slate-800 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col gap-3 rounded-2xl border px-5 py-4 shadow-sm backdrop-blur ${toneClasses}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/90 text-white shadow-sm dark:bg-white/90 dark:text-slate-900">
          {icon}
        </div>
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    </motion.div>
  );
}
