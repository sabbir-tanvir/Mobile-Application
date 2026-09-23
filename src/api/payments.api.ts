import { apiClient } from "./client";
import type { PaymentItem, CreatePaymentPayload, PaymentFilters } from "./types/payment.types";

export const paymentsApi = {
  list: async (filters?: PaymentFilters): Promise<PaymentItem[]> => {
    const res = await apiClient.get<PaymentItem[]>("/payments", { params: filters });
    return res.data;
  },

  create: async (payload: CreatePaymentPayload): Promise<PaymentItem> => {
    const res = await apiClient.post<PaymentItem>("/payments", payload);
    if (payload.bookingId && payload.status === "completed") {
      try {
        await apiClient.put(`/bookings/${payload.bookingId}`, {
          paymentStatus: "paid",
          paymentMethod: payload.method,
        });
      } catch (e) {
        console.warn("Could not sync booking payment status:", e);
      }
    }
    return res.data;
  },
};

