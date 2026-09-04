import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import type { NotificationListResponse } from "../types/notification";
import { notificationService } from "../api/notifications.api";



interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk<
  NotificationListResponse,
  void,
  { rejectValue: string }
>(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications();
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          "Failed to fetch notifications"
      );
    }
  }
);

// Mark one notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      return await notificationService.markAsRead(
        notificationId
      );
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          "Failed to mark notification as read"
      );
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk<
  {
    message: string;
    updated_count: number;
  },
  void,
  { rejectValue: string }
>(
  "notifications/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.markAllAsRead();
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          "Failed to mark notifications as read"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // -----------------------------
      // FETCH NOTIFICATIONS
      // -----------------------------
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchNotifications.fulfilled,
        (state, action) => {
          state.loading = false;

          state.notifications =
            action.payload.notifications;

          state.unreadCount =
            action.payload.unread_count;
        }
      )

      .addCase(
        fetchNotifications.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch notifications";
        }
      )

      // -----------------------------
      // MARK ONE AS READ
      // -----------------------------
      .addCase(
        markNotificationAsRead.fulfilled,
        (state, action) => {
          const updatedNotification =
            action.payload;

          const index =
            state.notifications.findIndex(
              (notification) =>
                notification.id ===
                updatedNotification.id
            );

          const existing =
            state.notifications[index];

          // Decrease unread count ONLY
          // if it was previously unread
          if (
            existing &&
            !existing.is_read
          ) {
            state.unreadCount = Math.max(
              0,
              state.unreadCount - 1
            );
          }

          if (index !== -1) {
            state.notifications[index] =
              updatedNotification;
          }
        }
      )

      .addCase(
        markNotificationAsRead.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to mark notification as read";
        }
      )

      // -----------------------------
      // MARK ALL AS READ
      // -----------------------------
      .addCase(
        markAllNotificationsAsRead.fulfilled,
        (state) => {
          state.notifications =
            state.notifications.map(
              (notification) => ({
                ...notification,
                is_read: true,
              })
            );

          state.unreadCount = 0;
        }
      )

      .addCase(
        markAllNotificationsAsRead.rejected,
        (state, action) => {
          state.error =
            action.payload ||
            "Failed to mark notifications as read";
        }
      );
  },
});

export const {
  clearNotificationError,
} = notificationSlice.actions;

export default notificationSlice.reducer;