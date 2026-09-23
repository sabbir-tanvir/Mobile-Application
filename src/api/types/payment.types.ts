import type { PaymentMethod } from "./booking.types";

export interface PaymentItem {
  id: string;
  bookingId?: string;
  amount: number;
  status: "completed" | "pending" | "refunded" | "failed";
  method: PaymentMethod | "other";
  transactionId?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
}

export interface CreatePaymentPayload {
  bookingId?: string;
  amount: number;
  method: PaymentMethod | "other";
  status?: string;
  transactionId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface PaymentFilters {
  status?: string;
  method?: string;
  search?: string;
  sort?: string;
  limit?: number;
}
