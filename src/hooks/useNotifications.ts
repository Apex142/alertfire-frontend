import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { Notification } from "@/types/notification";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger en temps réel
  const fetchNotifications = useCallback(() => {
    if (!user?.uid) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(
          data.sort(
            (a, b) =>
              (b.createdAt?.toMillis?.() ?? b.createdAt ?? 0) -
              (a.createdAt?.toMillis?.() ?? a.createdAt ?? 0)
          )
        );
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError("Impossible de charger les notifications");
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    const unsub = fetchNotifications();
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [fetchNotifications]);

  // Remettre à jour
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Tout marquer comme lu
  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const notif of unread) {
      await updateDoc(doc(db, "notifications", notif.id), { read: true });
    }
    setNotifications((prev) =>
      prev.map((n) => (n.read ? n : { ...n, read: true }))
    );
  }, [notifications]);

  // Gérer l'action (accepter/refuser invitation)
  const handleAction = useCallback(
    async (notif: Notification, accepted: boolean) => {
      if (!user) return;
      const notifRef = doc(db, "notifications", notif.id);

      await updateDoc(notifRef, {
        read: true,
        responded: true,
        accepted,
      });

      console.log("TEST11111111111");

      // Si acceptation -> update membership status
      if (accepted && notif.projectId && user?.uid) {
        const q = query(
          collection(db, "project_memberships"),
          where("userId", "==", user.uid),
          where("projectId", "==", notif.projectId)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const membershipDoc = snapshot.docs[0];
          const membershipRef = doc(
            db,
            "project_memberships",
            membershipDoc.id
          );
          await updateDoc(membershipRef, {
            status: "approved",
            updatedAt: serverTimestamp(),
          });
        }
      }

      console.log("TEST22222222222");

      // Si refus -> appelle l'API pour notifier l'inviteur + email
      console.log("notif.invitedBy", notif.context.invitedBy);

      console.log("accepted", accepted);
      console.log("notif.projectId", notif.projectId);
      if (!accepted && notif.context.invitedBy && notif.projectId) {
        try {
          alert(
            "Vous avez refusé l'invitation. L'inviteur sera notifié par email."
          );
          await fetch("/api/project/refused-invitation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inviteId: notif.id,
              userId: notif.userId,
              projectId: notif.projectId,
              invitedBy: notif.context.invitedBy,
              invitedUserName: user.displayName || user.email || "Utilisateur",
            }),
          });
        } catch (err) {
          console.error("Erreur lors de l'appel API invitation-refused", err);
        }
      }

      console.log("TEST33333333333");

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, read: true, responded: true } : n
        )
      );
    },
    [user]
  );

  // Compteur non-lu
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    isLoading,
    error,
    refreshNotifications,
    markAllAsRead,
    unreadCount,
    handleAction,
    setNotifications,
  };
}
