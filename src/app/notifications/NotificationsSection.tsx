import NotificationList from "@/components/NotificationList";
import { Notification } from "@/types/notification";
import { useState } from "react";

type Props = {
  title: string;
  notifications: Notification[];
  emptyMessage: string;
  onAction?: (notif: Notification, accepted: boolean) => void; // 👈
};

export default function NotificationsSection({
  notifications,
  emptyMessage,
  onAction,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section>
      <div>
        {notifications.length > 0 ? (
          <NotificationList
            notifications={notifications}
            expandedId={expandedId}
            onExpand={setExpandedId}
            onAction={onAction} // 👈
          />
        ) : (
          <div className="text-center py-6 text-gray-500">{emptyMessage}</div>
        )}
      </div>
    </section>
  );
}
