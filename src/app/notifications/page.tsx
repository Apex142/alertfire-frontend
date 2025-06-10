"use client";

import { Layout } from "@/components/layout/Layout";
import { Loading } from "@/components/ui/Loading";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationsHeader from "./NotificationsHeader";
import NotificationsSection from "./NotificationsSection";

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    error,
    refreshNotifications,
    markAllAsRead,
    unreadCount,
    handleAction, // <--- Hook gère tout
  } = useNotifications();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-10">
          <div className="text-center text-red-600 mb-4">{error}</div>
          <button
            onClick={refreshNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-6 pb-26 px-2">
        <NotificationsHeader
          unreadCount={unreadCount}
          onRefresh={refreshNotifications}
          onMarkAllAsRead={markAllAsRead}
        />
        <div className="bg-white border border-gray-200 rounded-xl shadow mt-4 overflow-hidden">
          <NotificationsSection
            title="Toutes les notifications"
            notifications={notifications}
            emptyMessage="Aucune notification."
            onAction={handleAction} // <--- Hook only, aucune logique locale
          />
        </div>
      </div>
    </Layout>
  );
}
