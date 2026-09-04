import {
  Bell,
  CheckCheck,
  X,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { markNotificationAsRead, markAllNotificationsAsRead, fetchNotifications } from "../../store/notifications";
import { useEffect } from "react";

interface NotificationModalProps {
  onClose: () => void;
}

export default function NotificationModal({
  onClose,
}: NotificationModalProps) {
  const dispatch = useAppDispatch();

  const {
    notifications,
    unreadCount,
    loading,
  } = useAppSelector(
    (state) => state.notifications
  );


  const loadNotifications=()=>{
    dispatch(fetchNotifications())
  }




  function handleMarkAsRead(id: string) {
    dispatch(markNotificationAsRead(id));
  }

  function handleMarkAllAsRead() {
    if (unreadCount > 0) {
      dispatch(markAllNotificationsAsRead());
    }
  }

  useEffect(()=>{
    loadNotifications()
  },[])

  return (
    <div
      className="
        absolute
        right-0
        top-12
        z-50
        w-[calc(100vw-2rem)]
        max-w-[390px]
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)]
        ring-1
        ring-black/5
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Bell className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Notifications
              </h2>

              <p className="text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="
            rounded-lg
            p-1.5
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-600
          "
          aria-label="Close notifications"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Actions */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-2.5">
          <span className="text-xs text-slate-500">
            Stay up to date with your account
          </span>

          <button
            onClick={handleMarkAllAsRead}
            className="
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-medium
              text-slate-700
              transition
              hover:text-slate-950
            "
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      )}

      {/* Notifications */}
      <div className="max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-3"
              >
                <div className="h-9 w-9 rounded-xl bg-slate-200" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-2 w-1/3 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Bell className="h-5 w-5 text-slate-400" />
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              No notifications
            </h3>

            <p className="mt-1 max-w-[240px] text-xs leading-5 text-slate-500">
              Important updates about your account will
              appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  if (!notification.is_read) {
                    handleMarkAsRead(
                      notification.id
                    );
                  }
                }}
                className={`
                  group
                  flex
                  w-full
                  gap-3
                  px-5
                  py-4
                  text-left
                  transition
                  hover:bg-slate-50
                  ${
                    !notification.is_read
                      ? "bg-slate-50/50"
                      : "bg-white"
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    relative
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    ${
                      notification.is_read
                        ? "bg-slate-100 text-slate-400"
                        : "bg-slate-900 text-white"
                    }
                  `}
                >
                  <Bell className="h-4 w-4" />

                  {!notification.is_read && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`
                        text-sm
                        ${
                          notification.is_read
                            ? "font-medium text-slate-700"
                            : "font-semibold text-slate-900"
                        }
                      `}
                    >
                      {notification.title}
                    </p>

                    {!notification.is_read && (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    )}
                  </div>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-[11px] text-slate-400">
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg py-2 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

