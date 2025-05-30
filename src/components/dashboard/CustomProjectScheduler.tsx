"use client";

import CreateProjectFlow from "@/features/projects/create/CreateProjectFlow";
import { useUserData } from "@/hooks/useUserData";
import {
  CalendarView,
  formatDate,
  getEventsForDay,
  getEventsForTimeRange,
  getMonthDays,
  getNextMonth,
  getNextWeek,
  getPreviousMonth,
  getPreviousWeek,
  getWeekDays,
  isCurrentDay,
  isCurrentMonth,
  sortEventsByDate,
} from "@/lib/calendarUtils";
import { cn } from "@/lib/utils";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Modal from "../ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Bell,
  Calendar,
  CalendarDays,
  Columns4,
  Grid3X3,
  Home,
  List,
} from "lucide-react";

interface Props {
  onProjectClick?: (projectId: string) => void;
}

export default function CustomProjectScheduler({ onProjectClick }: Props) {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Déterminer la période affichée selon la vue
  let from: Date, to: Date;
  if (view === "month") {
    from = startOfMonth(currentDate);
    to = endOfMonth(currentDate);
  } else if (view === "week") {
    from = startOfWeek(currentDate, { weekStartsOn: 1 });
    to = endOfWeek(currentDate, { weekStartsOn: 1 });
  } else {
    from = startOfMonth(currentDate);
    to = endOfMonth(currentDate);
  }

  // Hook pour charger dynamiquement les projects de l'utilisateur
  const { projects, loading, error } = useUserData();

  // Filtrer les projects selon la période affichée
  const filteredProjects = projects.filter((p) => {
    if (!p.startDate) return false;
    return (!from || p.startDate >= from) && (!to || p.startDate <= to);
  });

  // Adapter les projects pour matcher le type CalendarEvent
  const calendarProjects = filteredProjects.map((p) => ({
    ...p,
    status: (p.status === "Confirmé" || p.status === "validé"
      ? "confirmé"
      : "optionnel") as "confirmé" | "optionnel",
    startDate: p.startDate,
    endDate: p.endDate,
    id: p.id,
    name: p.projectName || p.name,
    projectName: p.projectName || p.name,
  }));

  // Obtenir les jours du mois courant
  const days = getMonthDays(currentDate);

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(getPreviousMonth(currentDate));
    } else if (view === "week") {
      setCurrentDate(getPreviousWeek(currentDate));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(getNextMonth(currentDate));
    } else if (view === "week") {
      setCurrentDate(getNextWeek(currentDate));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    {
      /* CALENDRIER MOIS */
    }
    const days = getMonthDays(currentDate);
    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gray-50 h-[50px] flex items-center justify-center text-xs font-medium text-gray-700"
          >
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(calendarProjects, day);
          const isToday = isCurrentDay(day);
          const isCurrentMonthDay = isCurrentMonth(day, currentDate);

          // Couleur de fond : couleur du premier project du jour, sinon bg-primary si au moins un project, sinon blanc
          let cellBg = "bg-white";
          if (dayEvents.length > 0) {
            cellBg = dayEvents[0].color || "bg-primary";
          }

          return (
            <div
              key={index}
              className={cn(
                "min-h-[100px] bg-white p-2",
                !isCurrentMonthDay && "bg-gray-50 text-gray-400",
                isToday && "bg-blue-50"
              )}
              onClick={() => {
                setSelectedDate(day);
                setOpenCreateModal(true);
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center gap-1 mb-2">
                <div
                  className={cn(
                    "text-sm font-medium",
                    isToday &&
                    "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                  )}
                >
                  {format(day, "d")}
                </div>
                <span className="text-xs text-gray-500">
                  {format(day, "EEE", { locale: fr })}
                </span>
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/project/${event.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onProjectClick?.(event.id);
                    }}
                    className="block"
                  >
                    <div
                      className={cn(
                        "cursor-pointer rounded p-1 text-xs",
                        "hover:opacity-80",
                        "border-l-4",
                        {
                          "border-green-500": event.status === "confirmé",
                          "border-yellow-500": event.status === "optionnel",
                        }
                      )}
                      style={{ backgroundColor: event.color || "bg-primary" }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="truncate font-medium text-white">
                          {event.projectName || event.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);

    return (
      <div className="flex overflow-x-auto h-full">
        {days.map((day) => {
          const dayEvents = getEventsForDay(calendarProjects, day);
          return (
            <div
              key={day.toISOString()}
              className="flex-1 border-r border-gray-200"
            >
              {/* En-tête du jour */}
              <div
                className={cn(
                  "border-b border-gray-200 p-2 text-center h-16",
                  isCurrentDay(day) && "bg-blue-50"
                )}
              >
                <div className="font-medium">
                  {format(day, "EEE", { locale: fr })}
                </div>
                <div
                  className={cn(
                    "text-sm text-gray-500",
                    isCurrentDay(day) &&
                    "mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white mx-auto"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>

              {/* Liste des projets du jour */}
              <div className="p-2 space-y-2">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/project/${event.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onProjectClick?.(event.id);
                    }}
                    className="block"
                  >
                    <div
                      className={cn(
                        "cursor-pointer rounded p-2 text-sm",
                        event.color,
                        "hover:opacity-80"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-white" />
                        <span className="font-medium text-white">
                          {event.name}
                        </span>
                      </div>
                      {event.startDate && (
                        <div className="text-xs text-white/80 mt-1">
                          {format(event.startDate, "HH:mm")}
                          {event.endDate && ` - ${format(event.endDate, "HH:mm")}`}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    const sortedProjects = sortEventsByDate(calendarProjects);

    return (
      <div className="space-y-4">
        {sortedProjects.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            onClick={() => onProjectClick?.(project.id)}
            className={cn(
              "cursor-pointer rounded-lg border border-gray-200 p-4 shadow-sm transition-shadow hover:shadow-md",
              project.color
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-white" />
                <h3 className="font-medium">{project.name}</h3>
              </div>
              <span
                className={cn("rounded-full px-2 py-1 text-xs font-medium", {
                  "bg-green-100 text-green-800": project.status === "confirmé",
                  "bg-yellow-100 text-yellow-800":
                    project.status === "optionnel",
                })}
              >
                {project.status}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {formatDate(
                project.startDate instanceof Date
                  ? project.startDate
                  : new Date(project.startDate)
              )}
              {project.endDate && (
                <>
                  {" - "}
                  {formatDate(
                    project.endDate instanceof Date
                      ? project.endDate
                      : new Date(project.endDate)
                  )}
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // Affichage loading/erreur
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500">
        Chargement des projects…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-1px)] md:h-[calc(100vh-theme(spacing.16)-1px)] h-[calc(100vh-theme(spacing.16)-1px-68px)] -m-4 p-[10px]">
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        {/* Navigation et contrôles sur une seule ligne */}
        <div className="flex items-center gap-2 flex-1">
          {(view === "month" || view === "week") && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:cursor-pointer"
                aria-label="Mois/Semaine précédente"
              >
                ←
              </button>
              <button
                onClick={handleToday}
                className="rounded-md p-2 hover:text-primary hover:bg-gray-100 hover:cursor-pointer flex items-center transition-colors"
                aria-label="Retour à aujourd'hui"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <span className="font-medium text-sm md:text-lg whitespace-nowrap">
                {view === "month"
                  ? format(currentDate, "MMMM yyyy", { locale: fr })
                  : `Semaine du ${format(
                    getWeekDays(currentDate)[0],
                    "d MMMM",
                    { locale: fr }
                  )}`}
              </span>
              <button
                onClick={handleNext}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:cursor-pointer"
                aria-label="Mois/Semaine suivante"
              >
                →
              </button>
            </div>
          )}
          {view === "list" && (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Liste des projets
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {calendarProjects.length} projet{calendarProjects.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Boutons de vue */}
        <div className="flex space-x-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setView("month")}
              className={cn(
                "rounded-md p-2 text-sm font-medium transition-colors hover:cursor-pointer",
                view === "month"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
              aria-label="Vue mois"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("week")}
              className={cn(
                "rounded-md p-2 text-sm font-medium transition-colors hover:cursor-pointer",
                view === "week"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
              aria-label="Vue semaine"
            >
              <Columns4 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "rounded-md p-2 text-sm font-medium transition-colors hover:cursor-pointer",
                view === "list"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
              aria-label="Vue liste"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {view === "month" && (
              <div className="grid grid-cols-7 gap-px bg-gray-200 h-full">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDay(calendarProjects, day);
                  const isToday = isCurrentDay(day);
                  const isCurrentMonthDay = isCurrentMonth(day, currentDate);

                  return (
                    <div
                      key={index}
                      className={cn(
                        "min-h-[100px] bg-white p-2",
                        !isCurrentMonthDay && "bg-gray-50 text-gray-400",
                        isToday && "bg-blue-50"
                      )}
                      onClick={() => {
                        setSelectedDate(day);
                        setOpenCreateModal(true);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex items-center gap-1 mb-2">
                        <div
                          className={cn(
                            "text-sm font-medium",
                            isToday &&
                            "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                          )}
                        >
                          {format(day, "d")}
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(day, "EEE", { locale: fr })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map((event) => (
                          <Link
                            key={event.id}
                            href={`/project/${event.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onProjectClick?.(event.id);
                            }}
                            className="block"
                          >
                            <div
                              className={cn(
                                "cursor-pointer rounded p-1 text-xs",
                                "hover:opacity-80",
                                "border-l-4",
                                {
                                  "border-green-500":
                                    event.status === "confirmé",
                                  "border-yellow-500":
                                    event.status === "optionnel",
                                }
                              )}
                              style={{
                                backgroundColor: event.color || "bg-primary",
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <span className="truncate font-medium text-white">
                                  {event.projectName || event.name}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {view === "week" && renderWeekView()}
            {view === "list" && renderListView()}
          </motion.div>
        </AnimatePresence>
      </div>
      <Modal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        title="Créer un project"
      >
        <CreateProjectFlow
          initialDate={
            selectedDate
              ? (() => {
                const d = new Date(selectedDate);
                d.setHours(0, 0, 0, 0);
                d.setHours(d.getHours() + 2);
                return d;
              })()
              : undefined
          }
        />
      </Modal>
    </div>
  );
}
