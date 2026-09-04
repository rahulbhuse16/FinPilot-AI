export type NotificationType =
  | "LOAN_REQUEST"
  | "LOAN_APPROVED"
  | "LOAN_REJECTED"
  | "LOAN_PAYMENT"
  | "LOAN_CLOSED"
  | "LARGE_TRANSACTION"
  | "UNUSUAL_TRANSACTION"
  | "LOW_BALANCE"
  | "FINANCIAL_INSIGHT"
  | "AI_RECOMMENDATION"
  | "SYSTEM";

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType | string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}

export interface MarkAllNotificationsResponse {
  message: string;
  updated_count: number;
}