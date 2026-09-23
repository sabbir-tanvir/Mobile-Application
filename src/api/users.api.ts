import { apiClient } from "./client";
import type {
  PlatformUser,
  CreateUserPayload,
  UpdateUserPayload,
} from "./types/user.types";

function normalizeUser(u: any): PlatformUser {
  return {
    id: String(u.id || u._id || ""),
    fullName: u.fullName || u.full_name || u.name || "Unnamed User",
    email: u.email || "",
    role: (u.role === "user" ? "customer" : u.role) || "staff",
    status: u.status || "active",
    imageUrl: u.imageUrl || u.image_url || "",
    imagePublicId: u.imagePublicId || u.image_public_id || "",
    createdAt: u.createdAt || u.created_at || "",
  };
}

export const usersApi = {
  list: async (params?: Record<string, any>): Promise<PlatformUser[]> => {
    const res = await apiClient.get<any[]>("/users", { params });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map(normalizeUser);
  },

  getById: async (id: string): Promise<PlatformUser> => {
    const res = await apiClient.get<any>(`/users/${id}`);
    return normalizeUser(res.data);
  },

  create: async (payload: CreateUserPayload): Promise<PlatformUser> => {
    const res = await apiClient.post<any>("/users", payload);
    return normalizeUser(res.data);
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<PlatformUser> => {
    const res = await apiClient.put<any>(`/users/${id}`, payload);
    return normalizeUser(res.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
