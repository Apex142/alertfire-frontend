"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Flame,
  MapPin,
  MessageCircle,
  MessageSquare,
  Radar,
  Route,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Type,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { useMapLayers } from "../MapLayersContext";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";

export type LayerFilterOption = {
  value: string;
  label: string;
  count?: number;
  accent?: string;
};

export type TimeRangeOption = {
  value: number;
  label: string;
  description?: string;
};

type LayerTogglePanelProps = {
  categoryOptions: LayerFilterOption[];
  severityOptions: LayerFilterOption[];
  timeOptions: TimeRangeOption[];
};

export const LayerTogglePanel = ({
  categoryOptions,
  severityOptions,
  timeOptions,
}: LayerTogglePanelProps) => {
  const {
    layers,
    filters,
    toggle,
    showAll,
    hideAll,
    reset,
    updateFilters,
    resetFilters,
  } = useMapLayers();
  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(min-width: 640px)").matches;
    }
    return true;
  });

  const selectedCategory = useMemo(
    () =>
      categoryOptions.find(
        (option) => option.value === filters.projectCategory
      ),
    [categoryOptions, filters.projectCategory]
  );

  const selectedSeverity = useMemo(
    () =>
      severityOptions.find((option) => option.value === filters.alertSeverity),
    [severityOptions, filters.alertSeverity]
  );

  type LayerKey = keyof typeof layers;

  type LayerToggleItem = {
    key: LayerKey;
    label: string;
    description?: string;
    icon: ReactNode;
  };

  type LayerSection = {
    title: string;
    items: LayerToggleItem[];
  };

  const sections: LayerSection[] = useMemo(
    () => [
      {
        title: "Incendies",
        items: [
          {
            key: "fireHalos",
            label: "Halos critiques",
            description: "Visualise l’étendue immédiate de l’incendie",
            icon: <Flame className="h-4 w-4" />,
          },
          {
            key: "fireLabels",
            label: "Labels incendie",
            description: "Nom & statut des foyers actifs",
            icon: <MessageSquare className="h-4 w-4" />,
          },
        ],
      },
      {
        title: "Propagation",
        items: [
          {
            key: "rangeCircles",
            label: "Rayons potentiels",
            description: "Zone estimée de propagation",
            icon: <Radar className="h-4 w-4" />,
          },
          {
            key: "rangeLabels",
            label: "Labels des rayons",
            description: "Distance et cible associées",
            icon: <Type className="h-4 w-4" />,
          },
          {
            key: "propagationLines",
            label: "Trajectoires",
            description: "Chemin prévisionnel du sinistre",
            icon: <Route className="h-4 w-4" />,
          },
          {
            key: "propagationLabels",
            label: "Labels trajets",
            description: "Détails des zones connectées",
            icon: <MessageCircle className="h-4 w-4" />,
          },
        ],
      },
      {
        title: "Zones sensibles",
        items: [
          {
            key: "threatenedHalos",
            label: "Zones menacées",
            description: "Enveloppe des zones sous risque",
            icon: <AlertTriangle className="h-4 w-4" />,
          },
          {
            key: "threatenedLabels",
            label: "Labels menaces",
            description: "Points ciblés et identités",
            icon: <MessageSquare className="h-4 w-4" />,
          },
        ],
      },
      {
        title: "Infrastructure",
        items: [
          {
            key: "projects",
            label: "Capteurs & sites",
            description: "Positionnement de chaque installation",
            icon: <MapPin className="h-4 w-4" />,
          },
        ],
      },
    ],
    []
  );

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[5.5rem] z-[1100] flex justify-center sm:inset-auto sm:right-6 sm:top-[6.5rem] sm:bottom-auto sm:justify-end">
      <div className="pointer-events-auto flex w-full max-w-[min(95vw,24rem)] flex-col items-center gap-3 sm:w-[min(22rem,90vw)] sm:items-end">
        <motion.button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 shadow-lg shadow-slate-900/30 transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:hidden"
          aria-label="Afficher les filtres de couches"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
        >
          <Settings2 className="h-4 w-4" />
          <span className="text-sm font-medium">Filtres</span>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.aside
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="flex w-full max-h-[72vh] flex-col gap-5 rounded-3xl border border-white/25 bg-gradient-to-br from-white/90 via-white/70 to-white/55 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:from-slate-950/92 dark:via-slate-900/85 dark:to-slate-900/78 dark:border-slate-800/60 sm:max-h-[78vh]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Carte dynamique
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Couches & légendes
                  </h3>
                </div>
                <motion.div
                  className="flex w-full flex-wrap gap-2 sm:max-w-full sm:flex-wrap sm:justify-end"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <motion.button
                    onClick={showAll}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white/65 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 sm:w-auto"
                    whileHover={{
                      y: -1,
                      boxShadow: "0px 10px 20px rgba(16,185,129,0.18)",
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <ToggleRight className="h-3.5 w-3.5" /> Tout
                  </motion.button>
                  <motion.button
                    onClick={hideAll}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white/65 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 sm:w-auto"
                    whileHover={{
                      y: -1,
                      boxShadow: "0px 10px 20px rgba(249,115,22,0.18)",
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <ToggleLeft className="h-3.5 w-3.5" /> Aucun
                  </motion.button>
                  <motion.button
                    onClick={reset}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white/65 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 sm:w-auto"
                    whileHover={{
                      y: -1,
                      boxShadow: "0px 10px 22px rgba(56,189,248,0.2)",
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Par défaut
                  </motion.button>
                </motion.div>
              </div>

              <div
                className="-mr-1 flex-1 space-y-5 overflow-y-auto pr-2 sm:pr-3"
                style={{ maxHeight: "calc(72vh - 6.5rem)" }}
              >
                <motion.div
                  key="layer-filters"
                  className="space-y-4 rounded-3xl border border-white/25 bg-white/75 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/70"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white shadow-sm dark:bg-white/90 dark:text-slate-900">
                        <SlidersHorizontal className="h-3 w-3" />
                        Filtres
                      </span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Affiner l’affichage des couches
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Combinez catégories, sévérité et horizon temporel.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-slate-600"
                    >
                      Réinitialiser
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Catégorie projet
                      </p>
                      <Select
                        value={filters.projectCategory}
                        onValueChange={(value) =>
                          updateFilters({
                            projectCategory:
                              typeof value === "string" ? value : "all",
                          })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-2xl border border-slate-200/70 bg-white/80 px-4 text-sm font-medium text-slate-700 transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200/70 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:focus:border-amber-400 dark:focus:ring-amber-300/30">
                          <span className="truncate">
                            {selectedCategory?.label ?? "Toutes les catégories"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex w-full items-center justify-between gap-3">
                                <span>{option.label}</span>
                                {typeof option.count === "number" && (
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    {option.count}
                                  </span>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Sévérité des alertes
                      </p>
                      <Select
                        value={filters.alertSeverity}
                        onValueChange={(value) =>
                          updateFilters({
                            alertSeverity:
                              typeof value === "string" ? value : "all",
                          })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-2xl border border-slate-200/70 bg-white/80 px-4 text-sm font-medium text-slate-700 transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200/70 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:focus:border-amber-400 dark:focus:ring-amber-300/30">
                          <span className="truncate">
                            {selectedSeverity?.label ?? "Toutes les sévérités"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                          {severityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex w-full items-center justify-between gap-3">
                                <span>{option.label}</span>
                                {typeof option.count === "number" && (
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    {option.count}
                                  </span>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Horizon temporel
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {timeOptions.map((option) => {
                        const active = option.value === filters.timeRange;
                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              updateFilters({ timeRange: option.value })
                            }
                            className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70 dark:focus-visible:ring-orange-400/40 ${
                              active
                                ? "bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] dark:bg-white dark:text-slate-900"
                                : "border border-slate-200/70 bg-white/70 text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-600"
                            }`}
                            whileHover={{ scale: active ? 1.015 : 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            aria-pressed={active}
                          >
                            {option.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
                {sections.map((section, sectionIndex) => (
                  <motion.div
                    key={section.title}
                    className="space-y-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.28,
                      delay: sectionIndex * 0.06,
                      ease: "easeOut",
                    }}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {section.title}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {section.items.map(
                        ({ key, label, description, icon }) => {
                          const active = layers[key];
                          return (
                            <motion.button
                              key={key}
                              type="button"
                              onClick={() => toggle(key)}
                              className={`group relative grid grid-cols-1 gap-3 rounded-3xl border px-5 py-5 text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                                active
                                  ? "border-emerald-200/80 bg-emerald-50/85 text-emerald-900 shadow-[0_15px_35px_rgba(16,185,129,0.18)] dark:border-emerald-400/35 dark:bg-emerald-500/12 dark:text-emerald-50"
                                  : "border-slate-200/60 bg-white/75 text-slate-600 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900/75 dark:text-slate-200"
                              }`}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.985 }}
                              transition={{ duration: 0.18, ease: "easeOut" }}
                            >
                              <div className="relative z-10 flex items-center justify-between gap-3">
                                <span
                                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm transition ${
                                    active
                                      ? "bg-emerald-500/18 text-emerald-500 dark:bg-emerald-400/25"
                                      : "bg-slate-200/70 text-slate-500 dark:bg-slate-800/70"
                                  }`}
                                >
                                  {icon}
                                </span>
                                <span
                                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                                    active
                                      ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.24)]"
                                      : "bg-slate-300"
                                  }`}
                                />
                              </div>
                              <div className="relative z-10 space-y-2">
                                <p className="text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">
                                  {label}
                                </p>
                                {description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {description}
                                  </p>
                                )}
                                <motion.span
                                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium ${
                                    active
                                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-600"
                                      : "border-slate-200/70 bg-white/60 text-slate-400"
                                  }`}
                                  initial={false}
                                  animate={{ opacity: 1 }}
                                >
                                  {active
                                    ? "Couché affichée"
                                    : "Couché masquée"}
                                </motion.span>
                              </div>
                            </motion.button>
                          );
                        }
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
