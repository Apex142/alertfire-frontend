"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * NotificationButton
 * -------------------
 * Affiche une cloche avec un badge indiquant le nombre d'alertes non lues.
 * - Survole : légère mise à l'échelle.
 * - Clic : redirige vers la page /alerts.
 * Utilise le hook `useNotifications` pour récupérer `unreadCount`.
 */
export default function NotificationButton() {
  const { appUser, firebaseUser } = useAuth();
  const isAuthenticated = Boolean(appUser || firebaseUser);
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  const isAlertsPage = pathname.startsWith("/alerts");

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push("/alerts")}
      aria-label="Notifications"
      className={`relative rounded-full p-2 transition-colors ${
        isAlertsPage
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </motion.button>
  );
}
