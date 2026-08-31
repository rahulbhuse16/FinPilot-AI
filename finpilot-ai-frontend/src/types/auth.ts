export type Role = "ADMIN" | "CUSTOMER";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  customer_id: string | null;
  is_active: boolean;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  customer_code?: string;
}
