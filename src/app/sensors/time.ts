import { Timestamp } from "firebase/firestore";

export type TemporalValue =
  | Timestamp
  | Date
  | number
  | string
  | null
  | undefined;

export const toDate = (value: TemporalValue): Date | null => {
  if (!value && value !== 0) return null;

  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();

  if (typeof value === "number") {
    if (Number.isNaN(value) || !Number.isFinite(value)) return null;
    return new Date(value);
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return null;
    return new Date(parsed);
  }

  return null;
};

const relativeFormatter = new Intl.RelativeTimeFormat("fr", {
  numeric: "auto",
});

const RELATIVE_UNITS: Array<{
  unit: Intl.RelativeTimeFormatUnit;
  ms: number;
}> = [
  { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
  { unit: "day", ms: 1000 * 60 * 60 * 24 },
  { unit: "hour", ms: 1000 * 60 * 60 },
  { unit: "minute", ms: 1000 * 60 },
  { unit: "second", ms: 1000 },
];

export const formatRelativeTime = (
  value: TemporalValue,
  fallback = "—"
): string => {
  const date = toDate(value);
  if (!date) return fallback;

  const diff = date.getTime() - Date.now();
  const absDiff = Math.abs(diff);

  const { unit, ms } =
    RELATIVE_UNITS.find((item) => absDiff >= item.ms) ?? RELATIVE_UNITS.at(-1)!;

  const rounded = Math.round(diff / ms);
  return relativeFormatter.format(rounded, unit);
};

export const formatDateTime = (
  value: TemporalValue,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = toDate(value);
  if (!date) return "—";

  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

export const formatDate = (
  value: TemporalValue,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = toDate(value);
  if (!date) return "—";

  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};
