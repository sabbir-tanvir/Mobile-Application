export type UserRole =
  | "admin"
  | "partner"
  | "owner"
  | "staff"
  | "customer"
  | "user";

export interface User {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name?: string;
  fullName?: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  error?: string;
}
