"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import NotificationList from "./NotificationList";

export default function NotificationButton() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    handleAction,
    setNotifications, // Peut être utile dans d'autres composants
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ferme le menu au clic hors
  // (tu peux aussi déplacer ce code dans un hook si tu veux factoriser, mais ici ça va)
  // Pas besoin de useEffect pour charger les notifications ici, le hook s'en occupe !

  // Fermer le menu au clic hors du dropdown
  // (meilleure UX)
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
        setExpandedId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition"
        aria-label="Voir les notifications"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <>
            {/* Badge visible */}
            <span className="absolute top-2 right-2 w-3 h-3 bg-blue-600 border-2 border-white rounded-full" />
            {/* Blink effet en dessous pour plus de visibilité */}
            <span className="absolute top-2 right-2 w-5 h-5 bg-blue-400 opacity-30 rounded-full animate-ping pointer-events-none" />
          </>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-[410px] bg-white border border-gray-200 shadow-2xl rounded-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 text-lg font-semibold text-gray-800">
              <span>Notifications</span>
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Tout lire
              </button>
            </div>
            {/* Liste compacte */}
            <NotificationList
              notifications={notifications}
              expandedId={expandedId}
              onExpand={setExpandedId}
              onAction={handleAction}
              compact
            />
            <div className="text-center border-t border-gray-200">
              <a
                href="/notifications"
                className="w-full block py-4 text-base text-blue-600 hover:underline"
                onClick={() => setOpen(false)}
              >
                Voir tout
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
