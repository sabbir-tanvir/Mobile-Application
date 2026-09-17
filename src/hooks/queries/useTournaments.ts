import { useQuery } from "@tanstack/react-query";
import { tournamentsApi } from "@/api/tournaments.api";
import type { Tournament } from "@/api/types/tournament.types";

export const tournamentKeys = {
  all: ["tournaments"] as const,
  lists: () => [...tournamentKeys.all, "list"] as const,
  list: (params: Record<string, any> = {}) =>
    [...tournamentKeys.lists(), params] as const,
  details: () => [...tournamentKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...tournamentKeys.details(), String(id)] as const,
};

export function useTournaments(params?: Record<string, any>) {
  return useQuery({
    queryKey: tournamentKeys.list(params),
    queryFn: () => tournamentsApi.list(params),
  });
}

export function useTournament(id: string | number) {
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => tournamentsApi.getById(id),
    enabled: !!id,
  });
}
