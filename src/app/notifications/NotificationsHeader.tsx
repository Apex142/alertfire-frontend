import { Bell, CheckCheck, RotateCw } from "lucide-react";

type Props = {
  unreadCount?: number;
  onRefresh: () => void;
  onMarkAllAsRead: () => void;
};

export default function NotificationsHeader({
  unreadCount = 0,
  onRefresh,
  onMarkAllAsRead,
}: Props) {
  return (
    <header
      className="
        bg-white dark:bg-[#222847]
        border border-gray-100 dark:border-[#262a44]
        rounded-2xl shadow-lg
        px-3 py-4 sm:px-5 sm:py-6
        mb-4 sm:mb-8
        flex flex-col gap-4
        sm:gap-2
        sm:flex-row sm:items-center sm:justify-between
        "
    >
      {/* Bloc gauche : icône + titre */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </h1>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 font-normal mt-1">
            Retrouvez ici toutes vos alertes importantes ou invitations.
          </div>
        </div>
      </div>

      {/* Bloc droit : boutons d'action */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-[#273467] text-blue-600 transition"
          title="Rafraîchir"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={onMarkAllAsRead}
          className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-[#273a36] text-green-600 transition"
          title="Tout marquer comme lu"
        >
          <CheckCheck className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
