"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
	CalendarClock,
	Download,
	Filter,
	FilePieChart,
	RefreshCcw,
} from "lucide-react";

import { BrandLoader } from "@/components/ui/BrandLoader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/Select";
import { notify } from "@/lib/notify";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useFireAlerts } from "@/hooks/useFireAlerts";
import { useProjects } from "@/hooks/useProjects";

type ReportRow = {
	projectId: string;
	projectLabel: string;
	alertCount: number;
	averageTemperature: number;
	averageConfidence: number;
	averageCo2: number;
	lastAlert: number | null;
};

const dayMillis = 24 * 60 * 60 * 1000;

function toInputDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

function getMillis(value: unknown): number | null {
	if (!value) return null;
	if (typeof value === "number") return value;
	if (typeof value === "string") {
		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? null : parsed;
	}
	if (value instanceof Date) return value.getTime();
	if (typeof (value as { toMillis?: () => number }).toMillis === "function") {
		return (value as { toMillis: () => number }).toMillis();
	}
	if (typeof (value as { toDate?: () => Date }).toDate === "function") {
		return (value as { toDate: () => Date }).toDate().getTime();
	}
	return null;
}

function formatNumber(value: number, unit?: string) {
	if (!Number.isFinite(value)) return "—";
	const formatted = value.toFixed(1);
	return unit ? `${formatted} ${unit}` : formatted;
}

function formatPercent(value: number) {
	if (!Number.isFinite(value)) return "—";
	return `${value.toFixed(1)} %`;
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

export default function ReportsPage() {
	const { isAuthenticated, loading } = useRequireAuth();

	if (loading || !isAuthenticated) {
		return <BrandLoader message="Chargement du module de rapports" />;
	}

	return <ReportsContent />;
}

function ReportsContent() {
	const today = useMemo(() => new Date(), []);
	const defaultStart = useMemo(() => {
		const date = new Date(Date.now() - 7 * dayMillis);
		date.setHours(0, 0, 0, 0);
		return date;
	}, []);

	const [startDate, setStartDate] = useState<string>(toInputDate(defaultStart));
	const [endDate, setEndDate] = useState<string>(toInputDate(today));
	const [selectedProject, setSelectedProject] = useState<string>("all");

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

	const projectLookup = useMemo(() => {
		const map = new Map<string, string>();
		projects.forEach((project) => {
			map.set(
				project.id,
				project.name || project.manualId || `Projet ${project.id.slice(0, 6)}`
			);
		});
		return map;
	}, [projects]);

	const dateRange = useMemo(() => {
		const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
		const end = endDate
			? new Date(endDate).setHours(23, 59, 59, 999)
			: Date.now();
		return { start, end };
	}, [startDate, endDate]);

	const filteredAlerts = useMemo(() => {
		return alerts.filter((alert) => {
			const timestamp = getMillis(alert.timestamp);
			if (timestamp === null) return false;
			if (dateRange.start !== null && timestamp < dateRange.start) return false;
			if (dateRange.end !== null && timestamp > dateRange.end) return false;
			if (selectedProject !== "all" && alert.project_id !== selectedProject)
				return false;
			return true;
		});
	}, [alerts, dateRange.end, dateRange.start, selectedProject]);

	const rows = useMemo<ReportRow[]>(() => {
		const groups = new Map<string, ReportRow & { tempSum: number; co2Sum: number; confSum: number }>();

		filteredAlerts.forEach((alert) => {
			const base = groups.get(alert.project_id);
			const timestamp = getMillis(alert.timestamp);
			if (!base) {
				groups.set(alert.project_id, {
					projectId: alert.project_id,
					projectLabel:
						projectLookup.get(alert.project_id) ??
						`Projet ${alert.project_id.slice(0, 6)}`,
					alertCount: 1,
					averageTemperature: alert.temperature ?? 0,
					averageCo2: alert.co2_level ?? 0,
					averageConfidence: alert.confidence ?? 0,
					lastAlert: timestamp,
					tempSum: alert.temperature ?? 0,
					co2Sum: alert.co2_level ?? 0,
					confSum: alert.confidence ?? 0,
				});
			} else {
				base.alertCount += 1;
				base.tempSum += alert.temperature ?? 0;
				base.co2Sum += alert.co2_level ?? 0;
				base.confSum += alert.confidence ?? 0;
				base.lastAlert = Math.max(base.lastAlert ?? 0, timestamp ?? 0);
			}
		});

		return Array.from(groups.values())
			.map((item) => ({
				projectId: item.projectId,
				projectLabel: item.projectLabel,
				alertCount: item.alertCount,
				averageTemperature: item.tempSum / Math.max(item.alertCount, 1),
				averageCo2: item.co2Sum / Math.max(item.alertCount, 1),
				averageConfidence: item.confSum / Math.max(item.alertCount, 1),
				lastAlert: item.lastAlert,
			}))
			.sort((a, b) => b.alertCount - a.alertCount);
	}, [filteredAlerts, projectLookup]);

	const summary = useMemo(() => {
		const totalAlerts = filteredAlerts.length;
		const avgTemp =
			filteredAlerts.reduce((acc, alert) => acc + (alert.temperature ?? 0), 0) /
			Math.max(totalAlerts, 1);
		const avgCo2 =
			filteredAlerts.reduce((acc, alert) => acc + (alert.co2_level ?? 0), 0) /
			Math.max(totalAlerts, 1);
		const avgConfidence =
			filteredAlerts.reduce((acc, alert) => acc + (alert.confidence ?? 0), 0) /
			Math.max(totalAlerts, 1);

		return {
			totalAlerts,
			avgTemp,
			avgCo2,
			avgConfidence,
		};
	}, [filteredAlerts]);

	const isLoading = projectsLoading || alertsLoading;

	const handleReset = () => {
		setStartDate(toInputDate(defaultStart));
		setEndDate(toInputDate(today));
		setSelectedProject("all");
	};

	const handleDownload = () => {
		if (rows.length === 0) {
			notify.info("Aucune donnée à exporter pour la période sélectionnée.");
			return;
		}

		const headers = [
			"Projet",
			"Identifiant",
			"Total alertes",
			"Température moyenne (°C)",
			"CO₂ moyen (ppm)",
			"Confiance moyenne (%)",
			"Dernière alerte",
		];

		const lines = rows.map((row) => [
			row.projectLabel.replace(/"/g, '""'),
			row.projectId,
			row.alertCount,
			row.averageTemperature.toFixed(1),
			row.averageCo2.toFixed(1),
			(row.averageConfidence * 100).toFixed(1),
			formatDateTime(row.lastAlert),
		]);

		const csvContent = [headers, ...lines]
			.map((line) =>
				line
					.map((cell) => (typeof cell === "string" ? `"${cell}"` : cell))
					.join(",")
			)
			.join("\n");

		const blob = new Blob(["\uFEFF" + csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `alertfire-rapport_${startDate}_au_${endDate}.csv`;
		link.click();
		URL.revokeObjectURL(url);
		notify.success("Rapport exporté au format CSV.");
	};

	if (isLoading) {
		return <BrandLoader message="Préparation des rapports consolidés" />;
	}

	if (projectsError || alertsError) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-16">
				<div className="rounded-3xl border border-red-200/70 bg-red-50 p-8 text-red-700 shadow-sm dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
					<h1 className="text-lg font-semibold">Erreur lors du chargement des rapports</h1>
					<p className="mt-2 text-sm opacity-80">
						{projectsError?.message || alertsError?.message ||
							"Merci de réessayer dans quelques instants."}
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
						Rapports d’incidents
					</h1>
					<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
						Analyse détaillée des alertes détectées, exportable pour vos équipes.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						startIcon={<RefreshCcw className="h-4 w-4" />}
						onClick={handleReset}
					>
						Réinitialiser
					</Button>
					<Button
						variant="primary"
						size="sm"
						startIcon={<Download className="h-4 w-4" />}
						onClick={handleDownload}
					>
						Export CSV
					</Button>
				</div>
			</header>

			<section className="grid grid-cols-1 gap-4 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/40 dark:bg-slate-900/70">
				<div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
					<Filter className="h-4 w-4" />
					Filtres
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
					<Input
						type="date"
						label="Date de début"
						value={startDate}
						onChange={(event) => setStartDate(event.target.value)}
						max={endDate}
					/>
					<Input
						type="date"
						label="Date de fin"
						value={endDate}
						onChange={(event) => setEndDate(event.target.value)}
						min={startDate}
					/>
					<div className="md:col-span-2">
						<p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
							Projet
						</p>
						<Select
							value={selectedProject}
							onValueChange={(value) => setSelectedProject(String(value))}
						>
							<SelectTrigger className="h-11 rounded-lg border border-slate-200/70 bg-white/80 px-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
								{selectedProject === "all"
									? "Tous les projets"
									: projectLookup.get(selectedProject) ?? selectedProject}
							</SelectTrigger>
							<SelectContent className="rounded-xl border border-slate-200/70 bg-white/95 py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
								<SelectItem value="all">Tous les projets</SelectItem>
								{projects.map((project) => (
									<SelectItem key={project.id} value={project.id}>
										{project.name || project.manualId || project.id}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</section>

			<section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
				<SummaryTile
					icon={<FilePieChart className="h-5 w-5" />}
					label="Total alertes"
					value={summary.totalAlerts}
				/>
				<SummaryTile
					icon={<CalendarClock className="h-5 w-5" />}
					label="Température moyenne"
					value={formatNumber(summary.avgTemp, "°C")}
				/>
				<SummaryTile
					icon={<CalendarClock className="h-5 w-5" />}
					label="Confiance moyenne"
					value={formatPercent(summary.avgConfidence * 100)}
					helper={`CO₂ moyen ${formatNumber(summary.avgCo2, "ppm")}`}
				/>
			</section>

			<section className="mt-8 overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/40 dark:bg-slate-900/70">
				<div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/60">
					<div>
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							Détail par projet
						</h2>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							{rows.length} ligne{rows.length > 1 ? "s" : ""} générée{rows.length > 1 ? "s" : ""}
						</p>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
						<thead className="bg-slate-50/60 dark:bg-slate-800/60">
							<tr>
								<th className="px-6 py-3 text-left font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
									Projet
								</th>
								<th className="px-6 py-3 text-left font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
									Alertes
								</th>
								<th className="px-6 py-3 text-left font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
									Température
								</th>
								<th className="px-6 py-3 text-left font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
									CO₂
								</th>
								<th className="px-6 py-3 text-left font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
									Confiance
								</th>
								<th className="px-6 py-3 text-left font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
									Dernière alerte
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
							{rows.length === 0 && (
								<tr>
									<td
										colSpan={6}
										className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-300"
									>
										Aucun événement enregistré sur la période sélectionnée.
									</td>
								</tr>
							)}
							{rows.map((row) => (
								<tr key={row.projectId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60">
									<td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">
										<div className="flex flex-col">
											<span>{row.projectLabel}</span>
											<span className="text-xs text-slate-400 dark:text-slate-500">
												{row.projectId}
											</span>
										</div>
									</td>
									<td className="px-6 py-3 text-slate-600 dark:text-slate-300">
										{row.alertCount}
									</td>
									<td className="px-6 py-3 text-slate-600 dark:text-slate-300">
										{formatNumber(row.averageTemperature, "°C")}
									</td>
									<td className="px-6 py-3 text-slate-600 dark:text-slate-300">
										{formatNumber(row.averageCo2, "ppm")}
									</td>
									<td className="px-6 py-3 text-slate-600 dark:text-slate-300">
										{formatPercent(row.averageConfidence * 100)}
									</td>
									<td className="px-6 py-3 text-slate-600 dark:text-slate-300">
										{formatDateTime(row.lastAlert)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</main>
	);
}

function SummaryTile({
	icon,
	label,
	value,
	helper,
}: {
		icon: ReactNode;
	label: string;
	value: string | number;
	helper?: string;
}) {
	return (
		<Card className="flex flex-col gap-2 rounded-3xl bg-gradient-to-br from-white via-white/80 to-white/60 p-6 shadow-none dark:from-slate-900 dark:via-slate-900/70 dark:to-slate-900/60">
			<div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
				<span className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
					{icon}
				</span>
				<span className="text-sm font-semibold">{label}</span>
			</div>
			<span className="text-2xl font-semibold text-slate-900 dark:text-white">
				{value}
			</span>
			{helper && (
				<span className="text-xs text-slate-500 dark:text-slate-400">{helper}</span>
			)}
		</Card>
	);
}
