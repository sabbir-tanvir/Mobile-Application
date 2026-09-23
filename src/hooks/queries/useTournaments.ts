import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tournamentsApi } from "@/api/tournaments.api";
import type {
  Tournament,
  CreateTournamentPayload,
  UpdateTournamentPayload,
} from "@/api/types/tournament.types";

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

export function useCreateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTournamentPayload) => tournamentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
    },
  });
}

export function useUpdateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: UpdateTournamentPayload;
    }) => tournamentsApi.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
      queryClient.setQueryData(tournamentKeys.detail(variables.id), data);
    },
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => tournamentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
    },
  });
}
