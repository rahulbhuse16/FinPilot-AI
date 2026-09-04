import { api } from "./axios";
import type {
  Notification,
  NotificationListResponse,
  MarkAllNotificationsResponse,
} from "../types/notification";

/**
 * Notification API service — the ONLY place that talks to the
 * notification endpoints. Components consume these functions
 * and never call axios directly for notifications.
 */
export const notificationService = {
  /** GET /notifications — notifications for the authenticated user. */
  async getNotifications(
    signal?: AbortSignal
  ): Promise<NotificationListResponse> {
    const { data } = await api.get<NotificationListResponse>(
      "/notifications",
      { signal }
    );

    return data;
  },

  /** PATCH /notifications/{notificationId}/read — mark one notification as read. */
  async markAsRead(
    notificationId: string
  ): Promise<Notification> {
    const { data } = await api.patch<Notification>(
      `/notifications/${notificationId}/read`
    );

    return data;
  },

  /** PATCH /notifications/read-all — mark all notifications as read. */
  async markAllAsRead(): Promise<MarkAllNotificationsResponse> {
    const { data } =
      await api.patch<MarkAllNotificationsResponse>(
        "/notifications/read-all"
      );

    return data;
  },
};