import { apiClient } from "./client";
import type {
  Tournament,
  CreateTournamentPayload,
  UpdateTournamentPayload,
  TournamentTeam,
} from "./types/tournament.types";

export function parseTournamentTeams(teams: any): TournamentTeam[] {
  if (!teams) return [];
  if (Array.isArray(teams)) {
    return teams.map((t) => ({
      name: t.name || "",
      captainName: t.captainName || t.captain_name || "",
      captainPhone: t.captainPhone || t.captain_phone || "",
      paid: Boolean(t.paid),
    }));
  }
  if (typeof teams === "string") {
    try {
      const parsed = JSON.parse(teams);
      if (Array.isArray(parsed)) {
        return parsed.map((t) => ({
          name: t.name || "",
          captainName: t.captainName || t.captain_name || "",
          captainPhone: t.captainPhone || t.captain_phone || "",
          paid: Boolean(t.paid),
        }));
      }
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeTournament(t: any): Tournament {
  return {
    ...t,
    id: String(t.id || t._id),
    turfId: String(t.turfId || t.turf_id || ""),
    turfName: t.turfName || t.turf_name || "Turf Arena",
    startDate: t.startDate || t.start_date || "",
    endDate: t.endDate || t.end_date || "",
    maxTeams: Number(t.maxTeams || t.max_teams || 8),
    entryFee: Number(t.entryFee || t.entry_fee || 0),
    prizePool: Number(t.prizePool || t.prize_pool || 0),
    status: t.status || "upcoming",
    format: t.format || "knockout",
    teams: parseTournamentTeams(t.teams),
  };
}

export const tournamentsApi = {
  list: async (params?: Record<string, any>): Promise<Tournament[]> => {
    const res = await apiClient.get<any[]>("/tournaments", { params });
    const rawList = Array.isArray(res.data) ? res.data : [];
    return rawList.map(normalizeTournament);
  },

  getById: async (id: string | number): Promise<Tournament> => {
    const res = await apiClient.get<any>(`/tournaments/${id}`);
    return normalizeTournament(res.data);
  },

  create: async (payload: CreateTournamentPayload): Promise<Tournament> => {
    // If teams is an array, stringify it so Prisma handles it properly without schema mismatch
    const dataToSend = {
      ...payload,
      teams: Array.isArray(payload.teams) ? JSON.stringify(payload.teams) : payload.teams,
    };
    const res = await apiClient.post<any>("/tournaments", dataToSend);
    return normalizeTournament(res.data);
  },

  update: async (
    id: string | number,
    payload: UpdateTournamentPayload
  ): Promise<Tournament> => {
    const dataToSend = {
      ...payload,
      teams: Array.isArray(payload.teams) ? JSON.stringify(payload.teams) : payload.teams,
    };
    const res = await apiClient.put<any>(`/tournaments/${id}`, dataToSend);
    return normalizeTournament(res.data);
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/tournaments/${id}`);
  },
};
