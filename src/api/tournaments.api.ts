import { apiClient } from "./client";
import type { Tournament } from "./types/tournament.types";

export const tournamentsApi = {
  list: async (params?: Record<string, any>): Promise<Tournament[]> => {
    const res = await apiClient.get<Tournament[]>("/tournaments", { params });
    return res.data;
  },

  getById: async (id: string | number): Promise<Tournament> => {
    const res = await apiClient.get<Tournament>(`/tournaments/${id}`);
    return res.data;
  },
};
