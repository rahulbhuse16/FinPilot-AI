import { BellIcon } from "lucide-react";
import React from "react";

interface NotificationBadgeProps {
  count: number;
  onClick: () => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        count > 0
          ? `${count} unread notifications`
          : "Notifications"
      }
      className="relative flex items-center justify-center"
    >
      {/* Notification Icon */}
      <span className="text-xl">
        <BellIcon/>
      </span>

      {/* Count Badge */}
      {count > 0 && (
        <span
          className="
            absolute
            -right-2
            -top-2
            flex
            min-h-5
            min-w-5
            items-center
            justify-center
            rounded-full
            bg-red-500
            px-1
            text-xs
            font-semibold
            text-white
          "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;

