import { apiClient } from "./client";
import type { OrderItem, CreateOrderPayload } from "./types/product.types";

export const ordersApi = {
  list: async (): Promise<OrderItem[]> => {
    const res = await apiClient.get<OrderItem[]>("/orders");
    return res.data;
  },

  create: async (payload: CreateOrderPayload): Promise<OrderItem> => {
    // If items is an array, stringify it if necessary or pass as is
    const res = await apiClient.post<OrderItem>("/orders", {
      ...payload,
      items: typeof payload.items === "string" ? payload.items : JSON.stringify(payload.items),
    });
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateOrderPayload>): Promise<OrderItem> => {
    const res = await apiClient.put<OrderItem>(`/orders/${id}`, payload);
    return res.data;
  },
};
