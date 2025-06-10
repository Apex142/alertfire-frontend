"use client";
import CreateProjectFlow from "@/features/project/create/CreateProjectFlow";
import { Project as AppProjectType, useProjects } from "@/hooks/useProjects";
import {
  CalendarView,
  formatDate,
  getEventsForDay,
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
import { format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Columns4,
  Grid3X3,
  List,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Loading } from "../ui/Loading";
import Modal from "../ui/Modal";

// --- CALENDAR EVENT ---
interface CalendarEvent {
  id: string;
  name: string;
  projectName: string;
  startDate: Date;
  endDate: Date | null;
  status: "confirmé" | "optionnel" | "annulé" | "à-confirmer" | string;
  color: string; // HEX ou classe Tailwind
  rawProject: AppProjectType;
}

interface SchedulerProps {
  onProjectClick?: (projectId: string) => void;
  activeCalendars?: string[];
}

// --- PALETTE PASTEL AUTO ---
const pastelPalette = [
  "bg-[#A5D8FF]",
  "bg-[#FFD6A5]",
  "bg-[#CAFFBF]",
  "bg-[#BDB2FF]",
  "bg-[#FDFFB6]",
  "bg-[#FFADAD]",
  "bg-[#9BF6FF]",
  "bg-[#FFC6FF]",
  "bg-[#E7C6FF]",
  "bg-[#FDFFB6]",
];

// Petit hash pour choisir une couleur pastel
function pastelColorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return pastelPalette[Math.abs(hash) % pastelPalette.length];
}

// --- COMPONENT ---
export default function CustomProjectScheduler({
  onProjectClick,
  activeCalendars = [],
}: SchedulerProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(
    null
  );

  const {
    projects: rawProjects,
    loading,
    error: projectsError,
  } = useProjects();

  // --- Format CalendarEvents ---
  const calendarEvents = useMemo((): CalendarEvent[] => {
    if (!rawProjects) return [];
    console.log("CustomProjectScheduler: rawProjects", rawProjects);

    return rawProjects.map((p: AppProjectType): CalendarEvent => {
      let displayStatus: CalendarEvent["status"] = "à-confirmer";
      if (["Confirmé", "validé", "active"].includes(p.status))
        displayStatus = "confirmé";
      else if (p.status === "Optionnel") displayStatus = "optionnel";
      else if (["Annulé", "archived"].includes(p.status))
        displayStatus = "annulé";
      else if (p.status === "À confirmer") displayStatus = "à-confirmer";
      else displayStatus = p.status;
      return {
        id: p.id,
        name: p.projectName || (p as any).name || "Sans nom",
        projectName: p.projectName || (p as any).name || "Sans nom",
        startDate:
          p.startDate instanceof Date
            ? p.startDate
            : typeof p.startDate?.toDate === "function"
            ? p.startDate.toDate()
            : new Date(p.startDate),
        endDate: p.endDate
          ? p.endDate instanceof Date
            ? p.endDate
            : typeof p.endDate?.toDate === "function"
            ? p.endDate.toDate()
            : new Date(p.endDate)
          : null,

        status: displayStatus,
        color: p.color?.startsWith("#")
          ? `bg-[${p.color}]`
          : p.color || pastelColorFor(p.id),
        rawProject: p,
      };
    });
  }, [rawProjects]);

  const daysForMonthView = useMemo(
    () => getMonthDays(currentDate),
    [currentDate]
  );
  const daysForWeekView = useMemo(
    () => getWeekDays(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );
  const staticWeekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const handlePrevious = useCallback(() => {
    if (view === "month") setCurrentDate(getPreviousMonth(currentDate));
    else if (view === "week")
      setCurrentDate(getPreviousWeek(currentDate, { weekStartsOn: 1 }));
  }, [view, currentDate]);
  const handleNext = useCallback(() => {
    if (view === "month") setCurrentDate(getNextMonth(currentDate));
    else if (view === "week")
      setCurrentDate(getNextWeek(currentDate, { weekStartsOn: 1 }));
  }, [view, currentDate]);
  const handleToday = useCallback(() => setCurrentDate(new Date()), []);
  const handleDayCellClick = useCallback((day: Date) => {
    setSelectedDateForModal(day);
    setIsCreateModalOpen(true);
  }, []);

  // --- HEADER ---
  const renderHeader = () => (
    <div className="sticky top-0 z-20 flex items-center justify-between px-2 sm:px-6 py-3 bg-white/90 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleToday}
          className="p-2 rounded-full hover:bg-primary/10 dark:hover:bg-blue-700/30 text-primary"
        >
          <CalendarDays className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="font-bold text-base sm:text-lg ml-2 text-gray-800 dark:text-white select-none">
          {view === "month"
            ? format(currentDate, "MMMM yyyy", { locale: fr })
            : `Semaine du ${format(
                startOfWeek(currentDate, { weekStartsOn: 1 }),
                "d MMM",
                { locale: fr }
              )}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="hidden sm:flex gap-1"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Créer</span>
        </Button>
        <div className="flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          {(["month", "week", "list"] as const).map((v) => {
            const icons = { month: Grid3X3, week: Columns4, list: List };
            const Icon = icons[v];
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-lg p-2 transition shadow-sm",
                  view === v
                    ? "bg-primary/80 text-white font-semibold"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // --- MONTH VIEW ---
  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px h-full bg-gray-100 dark:bg-gray-800">
      {staticWeekDays.map((d) => (
        <div
          key={d}
          className="p-2 text-xs font-bold text-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10"
        >
          {d}
        </div>
      ))}
      {daysForMonthView.map((day, index) => {
        const dayEvents = getEventsForDay(calendarEvents, day);
        const isToday = isCurrentDay(day);
        const isCurrentMonthDay = isCurrentMonth(day, currentDate);

        return (
          <div
            key={index}
            className={cn(
              "relative flex flex-col min-h-[110px] sm:min-h-[120px] bg-white dark:bg-gray-900 p-1.5 border border-gray-200 dark:border-gray-800 transition cursor-pointer group",
              !isCurrentMonthDay &&
                "bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500",
              isToday && "ring-2 ring-primary ring-inset"
            )}
            onClick={() => handleDayCellClick(day)}
          >
            <span
              className={cn(
                "absolute right-2 top-2 text-xs font-bold select-none",
                isToday && "text-primary"
              )}
            >
              {format(day, "d")}
            </span>
            <div className="flex flex-col gap-1 mt-5">
              {dayEvents.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  href={`/project/${event.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onProjectClick?.(event.id);
                  }}
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-semibold text-gray-800 dark:text-white truncate",
                    event.color,
                    "shadow-sm hover:scale-[1.04] transition-transform"
                  )}
                  title={event.name}
                >
                  {event.name}
                </Link>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[10px] text-gray-400 text-center">
                  + {dayEvents.length - 3} autres
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // --- WEEK VIEW ---
  const renderWeekView = () => (
    <div className="grid grid-cols-7 h-full">
      {daysForWeekView.map((day) => {
        const dayEvents = getEventsForDay(calendarEvents, day);
        const isToday = isCurrentDay(day);
        return (
          <div
            key={day.toISOString()}
            className={cn(
              "flex flex-col border border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900",
              isToday && "ring-2 ring-primary ring-inset"
            )}
          >
            <div
              className={cn(
                "text-xs font-semibold mb-2 text-center select-none",
                isToday && "text-primary"
              )}
            >
              {format(day, "EEE d", { locale: fr })}
            </div>
            <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
              {dayEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/project/${event.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onProjectClick?.(event.id);
                  }}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-xs font-semibold text-gray-800 dark:text-white truncate shadow hover:scale-[1.02] transition-transform",
                    event.color
                  )}
                  title={event.name}
                >
                  <span>{event.name}</span>
                  {event.startDate && (
                    <span className="ml-2 text-[10px] font-normal text-gray-700 dark:text-gray-300">
                      {format(event.startDate, "HH:mm")}
                      {event.endDate && `-${format(event.endDate, "HH:mm")}`}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // --- LIST VIEW ---
  const renderListView = () => {
    const eventsWithValidDates = calendarEvents.map((event) => ({
      ...event,
      startDate:
        event.startDate instanceof Date
          ? event.startDate
          : new Date(event.startDate),
    }));
    const sortedEvents = sortEventsByDate(eventsWithValidDates);

    return (
      <div className="p-2 md:p-4 space-y-2">
        {sortedEvents.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Aucun projet à afficher.
          </div>
        )}
        {sortedEvents.map((event) => (
          <Link
            key={event.id}
            href={`/project/${event.id}`}
            onClick={() => onProjectClick?.(event.id)}
            className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg px-4 py-2 border shadow-sm transition hover:shadow-lg",
              event.color
            )}
          >
            <div className="font-semibold truncate text-white/90">
              {event.name}
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium bg-white/40 text-gray-800 dark:bg-gray-800/70 dark:text-white/80"
                )}
              >
                {event.status.replace("-", " ")}
              </span>
              {event.startDate && (
                <span className="text-xs font-mono text-white/90">
                  {formatDate(event.startDate, "PPP à p", { locale: fr })}
                  {event.endDate &&
                    ` - ${formatDate(event.endDate, "PPP à p", {
                      locale: fr,
                    })}`}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // --- LOADING / ERROR ---
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-300">
        <Loading message="Chargement du calendrier..." />
      </div>
    );
  }
  if (projectsError) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-600 dark:text-red-400 p-4 text-center">
        <h3 className="text-lg font-semibold">
          Erreur de chargement des projets
        </h3>
        <p className="text-sm">{projectsError.message}</p>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="flex flex-col h-full w-full max-w-full rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
      {renderHeader()}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full w-full"
          >
            {view === "month" && renderMonthView()}
            {view === "week" && renderWeekView()}
            {view === "list" && renderListView()}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Modal création projet (à activer si besoin) */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Planifier un nouveau projet"
      >
        <CreateProjectFlow
          onProjectCreated={() => setIsCreateModalOpen(false)}
          initialDate={selectedDateForModal || new Date()}
        />
      </Modal>
    </div>
  );
}
