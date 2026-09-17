import { apiClient } from "./client";
import type {
  Booking,
  CreateBookingPayload,
  RecordPaymentPayload,
  PaymentRecord,
} from "./types/booking.types";

export const bookingsApi = {
  list: async (params?: Record<string, any>): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>("/bookings", { params });
    return res.data;
  },

  getById: async (id: string | number): Promise<Booking> => {
    const res = await apiClient.get<Booking>(`/bookings/${id}`);
    return res.data;
  },

  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    // If an initial payment is made at booking time, construct initial payment_history
    const paymentHistory: PaymentRecord[] =
      payload.paidAmount > 0
        ? [
            {
              amount: payload.paidAmount,
              method: payload.paymentMethod,
              date: new Date().toISOString(),
              txnId: payload.txnId,
              note: "Initial advance payment",
            },
          ]
        : [];

    const paymentStatus =
      payload.paidAmount >= payload.totalPrice
        ? "paid"
        : payload.paidAmount > 0
        ? "partial"
        : "unpaid";

    const body = {
      ...payload,
      paymentHistory,
      paymentStatus,
    };

    const res = await apiClient.post<Booking>("/bookings", body);
    return res.data;
  },

  update: async (
    id: string | number,
    payload: Partial<Booking>
  ): Promise<Booking> => {
    const res = await apiClient.put<Booking>(`/bookings/${id}`, payload);
    return res.data;
  },

  recordPayment: async (payload: RecordPaymentPayload): Promise<Booking> => {
    const current = await bookingsApi.getById(payload.bookingId);
    const existingHistory = Array.isArray(current.paymentHistory)
      ? current.paymentHistory
      : [];

    const newPaymentRecord: PaymentRecord = {
      amount: payload.amount,
      method: payload.paymentMethod,
      date: new Date().toISOString(),
      txnId: payload.txnId,
      note: payload.notes || "Partial installment",
    };

    const newPaidAmount = (current.paidAmount || 0) + payload.amount;
    const newPaymentStatus =
      newPaidAmount >= current.totalPrice ? "paid" : "partial";

    const updated = await bookingsApi.update(payload.bookingId, {
      paidAmount: newPaidAmount,
      paymentStatus: newPaymentStatus,
      paymentHistory: [...existingHistory, newPaymentRecord],
    });

    // Also record transaction in payments table
    try {
      await apiClient.post("/payments", {
        bookingId: payload.bookingId,
        amount: payload.amount,
        method: payload.paymentMethod,
        transactionId: payload.txnId,
        status: "completed",
        customerName: current.customerName,
        customerPhone: current.customerPhone,
      });
    } catch (e) {
      console.warn("Could not record standalone payment record:", e);
    }

    return updated;
  },

  cancel: async (id: string | number): Promise<Booking> => {
    const res = await apiClient.put<Booking>(`/bookings/${id}`, {
      status: "cancelled",
    });
    return res.data;
  },
};
