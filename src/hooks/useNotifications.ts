// src/hooks/useNotifications.ts
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { NotificationService } from "@/services/NotificationService";
import { Notification } from "@/types/entities/Notification";
import { useCallback, useEffect, useMemo, useState } from "react";

// Instanciation du service (client)
const notificationService = new NotificationService();

export function useNotifications() {
  const { appUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe aux notifications via le service
  useEffect(() => {
    if (!appUser?.uid) {
      setNotifications([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = notificationService.subscribeToUserNotifications(
      appUser.uid,
      (data: Notification[]) => {
        setNotifications(data);
        setIsLoading(false);
        setError(null);
      },
      (err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Impossible de charger les notifications.");
        }
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [appUser?.uid]);

  const refreshNotifications = useCallback(() => {
    if (!appUser?.uid) return;
    setIsLoading(true);
    notificationService.subscribeToUserNotifications(
      appUser.uid,
      (data: Notification[]) => {
        setNotifications(data);
        setIsLoading(false);
        setError(null);
      },
      (err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Impossible de charger les notifications.");
        }
        setIsLoading(false);
      }
    );
  }, [appUser?.uid]);

  const markAllAsRead = useCallback(async () => {
    if (!appUser || notifications.length === 0) return;
    setIsLoading(true);
    try {
      await notificationService.markAllAsRead(appUser.uid, notifications);
    } catch (e) {
      setError(
        (e as Error).message ||
          "Erreur lors de la mise à jour des notifications."
      );
    } finally {
      setIsLoading(false);
    }
  }, [appUser, notifications]);

  // => Cette fonction est entièrement déléguée au service
  const handleAction = useCallback(
    async (notif: Notification, accepted: boolean) => {
      if (!appUser?.uid) {
        setError("Action impossible: utilisateur non connecté.");
        return;
      }
      setIsLoading(true);
      try {
        await notificationService.handleNotificationAction({
          notif,
          accepted,
          userUid: appUser.uid,
        });
        // Pas besoin de mettre à jour l’état local ici : tout est réactif via subscribe
      } catch (e) {
        setError(
          (e as Error).message || "Erreur lors du traitement de l'action."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [appUser]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    isLoading,
    error,
    refreshNotifications,
    markAllAsRead,
    unreadCount,
    handleAction,
  };
}
