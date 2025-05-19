import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
  parseISO,
  isAfter,
  isBefore,
  isEqual
} from 'date-fns';
import { fr } from 'date-fns/locale';

export type CalendarView = 'month' | 'week' | 'list';

export interface CalendarEvent {
  id: string;
  name: string;
  startDate: string | Date;
  endDate?: string | Date;
  color: string;
  status: 'confirmé' | 'optionnel';
}

export function getMonthDays(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const startDay = startOfWeek(start, { locale: fr, weekStartsOn: 1 });
  const endDay = endOfWeek(end, { locale: fr, weekStartsOn: 1 });

  return eachDayOfInterval({ start: startDay, end: endDay });
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { locale: fr, weekStartsOn: 1 });
  return eachDayOfInterval({
    start,
    end: addDays(start, 6)
  });
}

export function getEventsForDay(events: CalendarEvent[], date: Date) {
  return events.filter(event => {
    const eventStart = event.startDate instanceof Date ? event.startDate : parseISO(event.startDate);
    const eventEnd = event.endDate
      ? (event.endDate instanceof Date ? event.endDate : parseISO(event.endDate))
      : eventStart;

    return (
      isSameDay(eventStart, date) ||
      isSameDay(eventEnd, date) ||
      (isAfter(date, eventStart) && isBefore(date, eventEnd))
    );
  });
}

export function getEventsForTimeRange(events: CalendarEvent[], date: Date, hour: number) {
  return events.filter(event => {
    const eventStart = event.startDate instanceof Date ? event.startDate : parseISO(event.startDate);
    const eventEnd = event.endDate
      ? (event.endDate instanceof Date ? event.endDate : parseISO(event.endDate))
      : eventStart;

    return (
      isSameDay(eventStart, date) &&
      eventStart.getHours() <= hour &&
      eventEnd.getHours() >= hour
    );
  });
}

export function formatDate(date: Date, formatStr: string = 'PPP') {
  return format(date, formatStr, { locale: fr });
}

export function isCurrentDay(date: Date) {
  return isToday(date);
}

export function isCurrentMonth(date: Date, currentDate: Date) {
  return isSameMonth(date, currentDate);
}

export function getNextMonth(date: Date) {
  return addMonths(date, 1);
}

export function getPreviousMonth(date: Date) {
  return subMonths(date, 1);
}

export function getNextWeek(date: Date) {
  return addDays(date, 7);
}

export function getPreviousWeek(date: Date) {
  return addDays(date, -7);
}

export function sortEventsByDate(events: CalendarEvent[]) {
  return [...events].sort((a, b) => {
    const dateA = a.startDate instanceof Date ? a.startDate : parseISO(a.startDate);
    const dateB = b.startDate instanceof Date ? b.startDate : parseISO(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });
} 