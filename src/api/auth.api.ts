import { apiClient } from "./client";
import type { LoginCredentials, RegisterPayload, User, AuthResponse } from "./types/auth.types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/login", credentials);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/register", payload);
    return res.data;
  },

  me: async (): Promise<User> => {
    const res = await apiClient.get<User>("/auth/me");
    return res.data;
  },

  desktopAutoLogin: async (): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/desktop-auto-login");
    return res.data;
  },
};
