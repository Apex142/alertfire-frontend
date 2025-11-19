"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
	Activity,
	ArrowDownRight,
	ArrowUpRight,
	BarChart3,
	Flame,
	Gauge,
	Layers,
	ThermometerSun,
	Zap,
} from "lucide-react";

import { BrandLoader } from "@/components/ui/BrandLoader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useFireAlerts } from "@/hooks/useFireAlerts";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/entities/Project";
import { ProjectStatus } from "@/types/enums/ProjectStatus";

const TIME_WINDOWS = [7, 14, 30] as const;

type TimeWindow = (typeof TIME_WINDOWS)[number];

const dayMillis = 24 * 60 * 60 * 1000;

const statusLabels: Record<ProjectStatus, string> = {
	[ProjectStatus.OK]: "Nominal",
	[ProjectStatus.WARNING]: "Sous surveillance",
	[ProjectStatus.FIRE]: "Feu confirmé",
	[ProjectStatus.BURNED]: "Brûlé",
	[ProjectStatus.OFFLINE]: "Hors ligne",
};

function getMillis(value: unknown): number | null {
	if (!value) return null;
	if (typeof value === "number") return value;
	if (typeof value === "string") {
		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? null : parsed;
	}
	if (value instanceof Date) return value.getTime();
	try {
		if (
			typeof (value as { toMillis?: () => number }).toMillis === "function"
		) {
			return (value as { toMillis: () => number }).toMillis();
		}
		if (
			typeof (value as { toDate?: () => Date }).toDate === "function"
		) {
			return (value as { toDate: () => Date }).toDate().getTime();
		}
	} catch (error) {
		console.warn("Impossible de convertir la date Firestore", error);
	}
	return null;
}

function formatPercent(value: number) {
	if (!Number.isFinite(value)) return "—";
	return `${value.toFixed(1)} %`;
}

function formatTemperature(value: number) {
	if (!Number.isFinite(value)) return "—";
	return `${value.toFixed(1)} °C`;
}

function formatDateTime(ms: number | null) {
	if (!ms) return "—";
	return new Date(ms).toLocaleString("fr-FR", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function AnalyticsPageGuard() {
	const { isAuthenticated, loading } = useRequireAuth();

	if (loading || !isAuthenticated) {
		return <BrandLoader message="Chargement des analyses en direct" />;
	}

	return <AnalyticsContent />;
}

export default function AnalyticsPage() {
	return <AnalyticsPageGuard />;
}

function AnalyticsContent() {
	const [daysWindow, setDaysWindow] = useState<TimeWindow>(7);

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

	const timeBounds = useMemo(() => {
		const now = Date.now();
		const start = now - daysWindow * dayMillis;
		const previousStart = start - daysWindow * dayMillis;
		return { now, start, previousStart };
	}, [daysWindow]);

	const alertsInWindow = useMemo(() => {
		return alerts.filter((alert) => {
			const timestamp = getMillis(alert.timestamp);
			return timestamp !== null && timestamp >= timeBounds.start;
		});
	}, [alerts, timeBounds.start]);

	const alertsPreviousWindow = useMemo(() => {
		return alerts.filter((alert) => {
			const timestamp = getMillis(alert.timestamp);
			return (
				timestamp !== null &&
				timestamp >= timeBounds.previousStart &&
				timestamp < timeBounds.start
			);
		});
	}, [alerts, timeBounds.previousStart, timeBounds.start]);

	const statusDistribution = useMemo(() => {
		const counts: Record<ProjectStatus, number> = {
			[ProjectStatus.OK]: 0,
			[ProjectStatus.WARNING]: 0,
			[ProjectStatus.FIRE]: 0,
			[ProjectStatus.BURNED]: 0,
			[ProjectStatus.OFFLINE]: 0,
		};

		projects.forEach((project) => {
			const status = project.status ?? ProjectStatus.OK;
			counts[status as ProjectStatus] =
				(counts[status as ProjectStatus] ?? 0) + 1;
		});

		return counts;
	}, [projects]);

	const topProjects = useMemo(() => {
		const projectMap = new Map<string, Project>();
		projects.forEach((project) => projectMap.set(project.id, project));

		const counter = new Map<
			string,
			{ count: number; lastAlert: number | null; project?: Project }
		>();

		alertsInWindow.forEach((alert) => {
			const current = counter.get(alert.project_id) ?? {
				count: 0,
				lastAlert: null,
				project: projectMap.get(alert.project_id),
			};
			const alertMillis = getMillis(alert.timestamp);
			counter.set(alert.project_id, {
				count: current.count + 1,
				lastAlert:
					alertMillis && current.lastAlert
						? Math.max(alertMillis, current.lastAlert)
						: alertMillis ?? current.lastAlert,
				project: current.project ?? projectMap.get(alert.project_id),
			});
		});

		return Array.from(counter.values())
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);
	}, [alertsInWindow, projects]);

	const alertsByDay = useMemo(() => {
		const buckets: { label: string; value: number }[] = [];
		const startOfToday = new Date(timeBounds.now);
		startOfToday.setHours(0, 0, 0, 0);

		for (let i = daysWindow - 1; i >= 0; i -= 1) {
			const dayStart = startOfToday.getTime() - i * dayMillis;
			const dayEnd = dayStart + dayMillis;
			const label = new Date(dayStart).toLocaleDateString("fr-FR", {
				weekday: "short",
				day: "2-digit",
			});
			const count = alertsInWindow.filter((alert) => {
				const timestamp = getMillis(alert.timestamp);
				return timestamp !== null && timestamp >= dayStart && timestamp < dayEnd;
			}).length;

			buckets.push({ label, value: count });
		}

		return buckets;
	}, [alertsInWindow, daysWindow, timeBounds.now]);

	const metrics = useMemo(() => {
		const activeAlerts = alerts.filter((alert) => alert.is_fire).length;
		const offlineProjects = projects.filter(
			(project) => project.status === ProjectStatus.OFFLINE
		).length;
		const newProjects = projects.filter((project) => {
			const createdAt = getMillis(project.createdAt);
			return createdAt !== null && createdAt >= timeBounds.start;
		}).length;

		const averageConfidence =
			alertsInWindow.reduce((acc, alert) => acc + (alert.confidence ?? 0), 0) /
			Math.max(alertsInWindow.length, 1);

		const previousAverageConfidence =
			alertsPreviousWindow.reduce(
				(acc, alert) => acc + (alert.confidence ?? 0),
				0
			) / Math.max(alertsPreviousWindow.length, 1);

		const averageTemperature =
			alertsInWindow.reduce((acc, alert) => acc + (alert.temperature ?? 0), 0) /
			Math.max(alertsInWindow.length, 1);

		const detectionRate =
			(alertsInWindow.filter((alert) => alert.is_fire).length /
				Math.max(alertsInWindow.length, 1)) *
			100;

		const previousDetectionRate =
			(alertsPreviousWindow.filter((alert) => alert.is_fire).length /
				Math.max(alertsPreviousWindow.length, 1)) *
			100;

		const trend = detectionRate - previousDetectionRate;
		const confidenceTrend =
			averageConfidence - previousAverageConfidence;

		return {
			totalProjects: projects.length,
			activeAlerts,
			detectionRate,
			detectionTrend: trend,
			averageConfidence,
			confidenceTrend,
			averageTemperature,
			offlineProjects,
			newProjects,
		};
	}, [
		alerts,
		alertsInWindow,
		alertsPreviousWindow,
		projects,
		timeBounds.start,
	]);

	const isLoading = projectsLoading || alertsLoading;

	if (isLoading) {
		return <BrandLoader message="Compilation des métriques terrain" />;
	}

	if (projectsError || alertsError) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-16">
				<div className="rounded-3xl border border-red-200/70 bg-red-50 p-8 text-red-700 shadow-sm dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
					<h1 className="text-lg font-semibold">Impossible de charger les analyses</h1>
					<p className="mt-2 text-sm opacity-80">
						{projectsError?.message || alertsError?.message ||
							"Vérifiez votre connexion ou réessayez plus tard."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<main className="mx-auto max-w-6xl px-4 py-10">
			<header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
						Analyses opérationnelles
					</h1>
					<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
						Vue consolidée des foyers, capteurs et performances sur les {daysWindow} derniers jours.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{TIME_WINDOWS.map((value) => (
						<Button
							key={value}
							variant={value === daysWindow ? "primary" : "outline"}
							size="sm"
							onClick={() => setDaysWindow(value)}
						>
							{value} j
						</Button>
					))}
				</div>
			</header>

			<section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
				<MetricCard
					icon={<Layers className="h-5 w-5" />}
					label="Sites suivis"
					value={metrics.totalProjects}
					description={`${metrics.newProjects} nouveaux ce créneau`}
				/>
				<MetricCard
					icon={<Flame className="h-5 w-5" />}
					label="Alertes actives"
					value={metrics.activeAlerts}
					description={`${alertsInWindow.length} alertes traitées`}
				/>
				<MetricCard
					icon={<Gauge className="h-5 w-5" />}
					label="Taux de détection"
					value={formatPercent(metrics.detectionRate)}
					trend={metrics.detectionTrend}
				/>
				<MetricCard
					icon={<ThermometerSun className="h-5 w-5" />}
					label="Température moyenne"
					value={formatTemperature(metrics.averageTemperature)}
					description={`${metrics.offlineProjects} capteurs hors ligne`}
				/>
			</section>

			<section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
				<Card className="flex flex-col gap-6">
					<div>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
								Volume quotidien d’alertes
							</h2>
							<span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
								Temps réel
							</span>
						</div>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							Somme des alertes reçues par jour sur la période sélectionnée.
						</p>
					</div>
					<div className="flex h-48 items-end gap-3">
						{alertsByDay.map((bucket) => (
							<div key={bucket.label} className="flex-1">
								<div
									className="relative flex h-40 items-end justify-center rounded-lg bg-slate-100/70 dark:bg-slate-800/60"
									aria-label={`${bucket.value} alertes pour ${bucket.label}`}
								>
									<div
										className="w-full rounded-lg bg-gradient-to-b from-orange-400 to-red-500 text-white shadow-[0_10px_30px_rgba(248,113,113,0.35)]"
										style={{ height: `${bucket.value === 0 ? 4 : Math.min(100, bucket.value * 8)}%` }}
									/>
								</div>
								<p className="mt-2 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
									{bucket.label}
								</p>
							</div>
						))}
					</div>
				</Card>

				<Card className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							Répartition des statuts
						</h2>
						<Activity className="h-5 w-5 text-orange-500" />
					</div>
					<ul className="space-y-3">
						{Object.entries(statusDistribution).map(([status, count]) => (
							<li key={status} className="flex items-center justify-between text-sm">
								<span className="flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-orange-400/80" />
									{statusLabels[status as ProjectStatus] ?? status}
								</span>
								<span className="font-semibold text-slate-800 dark:text-slate-200">
									{count}
								</span>
							</li>
						))}
					</ul>
					<p className="text-xs text-slate-500 dark:text-slate-400">
						{metrics.offlineProjects} capteur(s) hors ligne et {metrics.activeAlerts} foyer(s) à risque.
					</p>
				</Card>
			</section>

			<section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							Confiance algorithmique
						</h2>
						<Zap className="h-5 w-5 text-amber-500" />
					</div>
					<div className="flex flex-col gap-3">
						<p className="text-sm text-slate-600 dark:text-slate-300">
							Confiance moyenne des alertes pendant la fenêtre d’analyse.
						</p>
						<div className="flex items-baseline gap-3">
							<span className="text-3xl font-semibold text-slate-900 dark:text-white">
								{formatPercent(metrics.averageConfidence * 100)}
							</span>
							<TrendBadge value={metrics.confidenceTrend * 100} />
						</div>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Basé sur {alertsInWindow.length} alertes.
						</p>
					</div>
				</Card>

				<Card className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							Projets les plus sollicités
						</h2>
						<BarChart3 className="h-5 w-5 text-sky-500" />
					</div>
					<ul className="space-y-3 text-sm">
						{topProjects.length === 0 && (
							<li className="rounded-lg bg-slate-100/70 p-3 text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
								Aucune alerte reçue sur la période sélectionnée.
							</li>
						)}
						{topProjects.map((item, index) => (
							<li
								key={`${item.project?.id ?? index}-${item.count}`}
								className="rounded-lg border border-slate-200/70 bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
							>
								<div className="flex justify-between">
									<span className="font-semibold text-slate-800 dark:text-slate-100">
										{item.project?.name ?? item.project?.manualId ?? "Projet inconnu"}
									</span>
									<span className="text-xs text-slate-500 dark:text-slate-400">
										{item.count} alerte{item.count > 1 ? "s" : ""}
									</span>
								</div>
								<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
									Dernière alerte : {formatDateTime(item.lastAlert)}
								</p>
							</li>
						))}
					</ul>
				</Card>
			</section>
		</main>
	);
}

function MetricCard({
	icon,
	label,
	value,
	description,
	trend,
}: {
	icon: ReactNode;
	label: string;
	value: string | number;
	description?: string;
	trend?: number;
}) {
	return (
		<div className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white via-white/80 to-white/60 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-slate-800/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900/60">
			<div className="flex items-center justify-between">
				<span className="rounded-2xl bg-slate-900/90 p-2 text-white shadow-sm dark:bg-white/90 dark:text-slate-900">
					{icon}
				</span>
				{trend !== undefined && <TrendBadge value={trend} />}
			</div>
			<p className="mt-6 text-sm text-slate-500 dark:text-slate-300">{label}</p>
			<p className="text-3xl font-semibold text-slate-900 dark:text-white">
				{value}
			</p>
			{description && (
				<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
					{description}
				</p>
			)}
		</div>
	);
}

function TrendBadge({ value }: { value: number }) {
	if (!Number.isFinite(value) || value === 0) {
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
				Stable
			</span>
		);
	}

	const positive = value > 0;
	const Icon = positive ? ArrowUpRight : ArrowDownRight;
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
				positive
					? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
					: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-200"
			}`}
		>
			<Icon className="h-3.5 w-3.5" />
			{Math.abs(value).toFixed(1)}%
		</span>
	);
}
