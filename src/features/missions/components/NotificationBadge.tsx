import { Bell } from "lucide-react";

import { useNotificationStore }
from "../../notifications/notificationStore";

export function NotificationBadge() {

  const unread =
    useNotificationStore(
      (s) => s.unread
    );

  return (

    <div className="relative">

      <Bell size={24} />

      {unread > 0 && (

        <div
          className="
          absolute
          -right-2
          -top-2
          min-w-4.5
          rounded-full
          bg-red-500
          px-1
          text-center
          text-[11px]
          text-white
          font-bold
        "
        >
          {unread}
        </div>

      )}

    </div>

  );

}