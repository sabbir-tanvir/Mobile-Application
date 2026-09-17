import { apiClient } from "./client";
import type { Turf, TurfFilters } from "./types/turf.types";

export const turfsApi = {
  list: async (filters?: TurfFilters): Promise<Turf[]> => {
    const res = await apiClient.get<Turf[]>("/turfs", { params: filters });
    return res.data;
  },

  getById: async (id: string | number): Promise<Turf> => {
    const res = await apiClient.get<Turf>(`/turfs/${id}`);
    return res.data;
  },

  create: async (payload: Partial<Turf>): Promise<Turf> => {
    const res = await apiClient.post<Turf>("/turfs", payload);
    return res.data;
  },

  update: async (id: string | number, payload: Partial<Turf>): Promise<Turf> => {
    const res = await apiClient.put<Turf>(`/turfs/${id}`, payload);
    return res.data;
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/turfs/${id}`);
  },
};
