import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { turfsApi } from "@/api/turfs.api";
import type { Turf, TurfFilters } from "@/api/types/turf.types";

export const turfKeys = {
  all: ["turfs"] as const,
  lists: () => [...turfKeys.all, "list"] as const,
  list: (filters: TurfFilters = {}) => [...turfKeys.lists(), filters] as const,
  details: () => [...turfKeys.all, "detail"] as const,
  detail: (id: string | number) => [...turfKeys.details(), String(id)] as const,
};

export function useTurfs(filters?: TurfFilters) {
  return useQuery({
    queryKey: turfKeys.list(filters),
    queryFn: () => turfsApi.list(filters),
  });
}

export function useTurf(id: string | number) {
  return useQuery({
    queryKey: turfKeys.detail(id),
    queryFn: () => turfsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTurf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Turf>) => turfsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: turfKeys.lists() });
    },
  });
}
