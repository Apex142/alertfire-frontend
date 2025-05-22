// lib/date.ts
import { Timestamp } from "firebase/firestore";

export function formatFirebaseDate(
  date: Timestamp | Date | null | undefined
): string {
  if (!date) return "";

  const jsDate = date instanceof Timestamp ? date.toDate() : date;

  return jsDate.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
