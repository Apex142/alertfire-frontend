"use client";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("fr");

import { Notification } from "@/types/notification";
import { motion } from "framer-motion";
import { CheckCircle, UserCircle, XCircle } from "lucide-react";

// Utilitaire pour parser toutes les formes de date Firestore/JS
function parseDate(date: any): Date | undefined {
  if (!date) return undefined;
  if (typeof date === "string" || typeof date === "number") {
    return new Date(date);
  }
  if (date.toDate) {
    return date.toDate();
  }
  if (date instanceof Date) {
    return date;
  }
  return undefined;
}

type Props = {
  notifications: Notification[];
  expandedId?: string | null;
  onExpand?: (id: string | null) => void;
  onAction?: (notif: Notification, accepted: boolean) => void;
  compact?: boolean;
};

export default function NotificationList({
  notifications,
  expandedId,
  onExpand,
  onAction,
  compact = false,
}: Props) {
  if (notifications.length === 0) {
    return (
      <div
        className={`p-6 text-base text-gray-500 ${
          compact ? "py-2 text-sm" : ""
        }`}
      >
        Aucune notification.
      </div>
    );
  }
  return (
    <ul
      className={`divide-y divide-gray-100 ${
        compact ? "max-h-80" : "max-h-[520px]"
      } overflow-y-auto`}
    >
      {notifications.map((n) => {
        const isExpanded = expandedId === n.id;
        const notifDate = parseDate(n.createdAt);
        return (
          <motion.li
            key={n.id}
            layout
            transition={{ duration: 0.18 }}
            onClick={() =>
              n.type === "project_invite" && !n.responded && onExpand
                ? onExpand(isExpanded ? null : n.id)
                : undefined
            }
            className={`px-6 ${
              compact ? "py-3" : "py-5"
            } hover:bg-gray-50 cursor-pointer ${
              isExpanded ? "bg-gray-50" : ""
            }`}
          >
            <div className="flex items-start gap-5">
              <div>
                {n.avatarUrl ? (
                  <img
                    src={n.avatarUrl}
                    alt="avatar"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-11 h-11 text-gray-300" />
                )}
              </div>
              <div className="flex-1 text-base text-gray-800">
                <p className="mb-1 leading-snug">
                  <strong>{n.message.split(" ")[0]}</strong>{" "}
                  {n.message.slice(n.message.indexOf(" ") + 1)}
                </p>
                <div className="text-sm text-gray-500">
                  {notifDate ? dayjs(notifDate).fromNow() : "Date inconnue"}
                </div>
                {isExpanded &&
                  n.type === "project_invite" &&
                  !n.responded &&
                  onAction && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(n, true);
                        }}
                        className="p-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition"
                        aria-label="Accepter"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(n, false);
                        }}
                        className="p-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition"
                        aria-label="Refuser"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
              </div>
              {!n.read && (
                <span className="mt-2 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
