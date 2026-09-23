import { apiClient } from "./client";
import type {
  PartnerItem,
  CreatePartnerPayload,
  UpdatePartnerPayload,
  ReallocatePayload,
  PayoutItem,
  CreatePayoutPayload,
  ShareHistoryItem,
} from "./types/partner.types";

export const partnersApi = {
  list: async (): Promise<PartnerItem[]> => {
    const res = await apiClient.get<PartnerItem[]>("/partners");
    return res.data;
  },

  getById: async (id: string): Promise<PartnerItem> => {
    const res = await apiClient.get<PartnerItem>(`/partners/${id}`);
    return res.data;
  },

  create: async (payload: CreatePartnerPayload): Promise<PartnerItem> => {
    const res = await apiClient.post<PartnerItem>("/partners", payload);
    return res.data;
  },

  update: async (id: string, payload: UpdatePartnerPayload): Promise<PartnerItem> => {
    const res = await apiClient.put<PartnerItem>(`/partners/${id}`, payload);
    return res.data;
  },

  reallocate: async (payload: ReallocatePayload): Promise<any> => {
    const res = await apiClient.post("/partners/reallocate", payload);
    return res.data;
  },

  listPayouts: async (params?: { userId?: string; from?: string; to?: string }): Promise<PayoutItem[]> => {
    const res = await apiClient.get<PayoutItem[]>("/partners/payouts", { params });
    return res.data;
  },

  createPayout: async (payload: CreatePayoutPayload): Promise<PayoutItem> => {
    const res = await apiClient.post<PayoutItem>("/partners/payouts", payload);
    return res.data;
  },

  getShareHistory: async (limit = 20): Promise<ShareHistoryItem[]> => {
    const res = await apiClient.get<ShareHistoryItem[]>("/partners/shares/history", {
      params: { limit },
    });
    return res.data;
  },
};
