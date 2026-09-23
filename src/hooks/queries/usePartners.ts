import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnersApi } from "@/api/partners.api";
import type {
  CreatePartnerPayload,
  UpdatePartnerPayload,
  ReallocatePayload,
  CreatePayoutPayload,
} from "@/api/types/partner.types";
import { accountingKeys } from "./useAccounting";

export const partnerKeys = {
  all: ["partners"] as const,
  lists: () => [...partnerKeys.all, "list"] as const,
  detail: (id: string) => [...partnerKeys.all, "detail", id] as const,
  payouts: (userId?: string) => [...partnerKeys.all, "payouts", userId ?? "all"] as const,
  history: () => [...partnerKeys.all, "history"] as const,
};

export function usePartners() {
  return useQuery({
    queryKey: partnerKeys.lists(),
    queryFn: () => partnersApi.list(),
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => partnersApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePartnerPayload) => partnersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePartnerPayload }) =>
      partnersApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(variables.id) });
    },
  });
}

export function useReallocateShares() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReallocatePayload) => partnersApi.reallocate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.history() });
    },
  });
}

export function usePartnerPayouts(userId?: string) {
  return useQuery({
    queryKey: partnerKeys.payouts(userId),
    queryFn: () => partnersApi.listPayouts(userId ? { userId } : undefined),
  });
}

export function useCreatePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePayoutPayload) => partnersApi.createPayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.payouts() });
      queryClient.invalidateQueries({ queryKey: accountingKeys.ledger() });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useShareHistory() {
  return useQuery({
    queryKey: partnerKeys.history(),
    queryFn: () => partnersApi.getShareHistory(),
  });
}
