// src/components/notifications/NotificationList.tsx (ou un chemin similaire)
"use client";

import { cn } from "@/lib/utils"; // IMPORTÉ (si vous utilisez cette fonction utilitaire)
import { Notification } from "@/types/entities/Notification"; // IMPORTÉ
import dayjs from "dayjs";
import "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("fr");

import { NotificationType } from "@/types/enums/NotificationType";
import { motion } from "framer-motion";
import { CheckCircle, UserCircle, XCircle } from "lucide-react";
import Image from "next/image"; // Utilisation de next/image pour les optimisations
import { Button } from "./ui/Button";

// Utilitaire pour parser toutes les formes de date Firestore/JS
// (Assurez-vous que Timestamp de Firestore est bien géré si c'est le type dans Notification)
function parseDate(dateInput: any): Date | undefined {
  if (!dateInput) return undefined;
  // Si c'est déjà un objet Date JavaScript
  if (dateInput instanceof Date) {
    return dateInput;
  }
  // Si c'est un objet Timestamp Firestore (contient une méthode toDate)
  if (
    typeof dateInput === "object" &&
    dateInput !== null &&
    typeof dateInput.toDate === "function"
  ) {
    return dateInput.toDate();
  }
  // Si c'esst une chaîne ou un nombre (timestamp millisecondes)
  if (typeof dateInput === "string" || typeof dateInput === "number") {
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      // Vérifier si la date est valide
      return date;
    }
  }
  console.warn("parseDate: Could not parse date input:", dateInput);
  return undefined;
}

type Props = {
  notifications: Notification[];
  expandedId?: string | null;
  onExpand?: (id: string | null) => void;
  // Laisser onAction prendre la Notification complète pour plus de flexibilité
  onAction?: (notification: Notification, accepted: boolean) => void;
  compact?: boolean;
};

export default function NotificationList({
  notifications,
  expandedId,
  onExpand,
  onAction,
  compact = false,
}: Props) {
  if (!notifications || notifications.length === 0) {
    return (
      <div
        className={cn(
          "p-6 text-center text-gray-500 dark:text-gray-400",
          compact ? "py-3 text-sm" : "text-base"
        )}
      >
        Aucune nouvelle notification.
      </div>
    );
  }

  // Trier les notifications ici si elles ne sont pas déjà triées par le hook
  // const sortedNotifications = [...notifications].sort((a, b) => {
  //   const timeA = parseDate(a.createdAt)?.getTime() || 0;
  //   const timeB = parseDate(b.createdAt)?.getTime() || 0;
  //   return timeB - timeA;
  // });

  return (
    <ul
      className={cn(
        "divide-y divide-gray-200 dark:divide-gray-700", // Meilleur contraste pour les séparateurs en mode sombre
        compact ? "max-h-80" : "max-h-[calc(100vh-200px)] md:max-h-[520px]", // Hauteur max plus responsive
        "overflow-y-auto custom-scrollbar" // Pour un scroll plus discret si vous avez défini .custom-scrollbar
      )}
    >
      {notifications.map((n) => {
        const isExpanded = expandedId === n.id;
        const notifDate = parseDate(n.createdAt);

        // Logique pour séparer le titre (premier mot) du reste du message
        // Peut être rendu plus robuste si les messages ont une structure plus complexe
        // ou si un champ 'title' est disponible sur l'objet Notification.
        let boldPart = n.title || "";
        let remainingMessage = n.message;
        if (!n.title && n.message) {
          const firstSpaceIndex = n.message.indexOf(" ");
          if (firstSpaceIndex > 0) {
            boldPart = n.message.substring(0, firstSpaceIndex);
            remainingMessage = n.message.substring(firstSpaceIndex + 1);
          } else {
            boldPart = n.message; // Si pas d'espace, tout le message est en gras
            remainingMessage = "";
          }
        }

        // Condition pour permettre l'expansion et afficher les boutons d'action
        // Utiliser NotificationType pour une comparaison sûre
        const isActionableProjectInvite =
          n.type === NotificationType.PROJECT_INVITE_RECEIVED && // Utilisation de l'enum
          !n.responded &&
          onExpand &&
          onAction;

        return (
          <motion.li
            key={n.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() =>
              isActionableProjectInvite
                ? onExpand(isExpanded ? null : n.id)
                : undefined
            }
            className={cn(
              "px-4 sm:px-6 group", // Ajout de 'group' pour des effets de survol sur les enfants
              compact ? "py-3" : "py-4",
              "hover:bg-gray-50 dark:hover:bg-gray-700/50",
              isActionableProjectInvite ? "cursor-pointer" : "cursor-default",
              isExpanded && "bg-gray-50 dark:bg-gray-700/50"
            )}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 pt-0.5">
                {n.avatarUrl ? (
                  <Image // Utilisation de next/image
                    src={n.avatarUrl}
                    alt="Avatar de la notification"
                    width={40} // Taille standardisée
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <div className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                <p className="mb-0.5 leading-normal">
                  {boldPart && (
                    <strong className="font-semibold text-gray-800 dark:text-gray-100">
                      {boldPart}
                    </strong>
                  )}
                  {remainingMessage && ` ${remainingMessage}`}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {notifDate ? dayjs(notifDate).fromNow() : "Date inconnue"}
                </div>

                {isExpanded && isActionableProjectInvite && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3" // mt-4 a été déplacé dans l'animation
                  >
                    <Button
                      variant="successOutline" // Supposant que vous avez cette variante
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(n, true); // Passer la notification complète
                      }}
                      aria-label="Accepter l'invitation"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Accepter
                    </Button>
                    <Button
                      variant="dangerOutline" // Supposant que vous avez cette variante
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(n, false); // Passer la notification complète
                      }}
                      aria-label="Refuser l'invitation"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" /> Refuser
                    </Button>
                  </motion.div>
                )}
              </div>
              {!n.read && (
                <div className="flex-shrink-0 ml-2 mt-0.5">
                  {" "}
                  {/* Ajustement du positionnement du point */}
                  <span
                    className="w-2.5 h-2.5 bg-primary rounded-full block"
                    title="Non lue"
                  />
                  {/* Animation pulse enlevée car peut être distrayante sur une longue liste */}
                </div>
              )}
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
