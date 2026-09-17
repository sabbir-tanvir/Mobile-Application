export type PaymentMethod = "bkash" | "nagad" | "rocket" | "cash" | "card";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type BookingStatus = "confirmed" | "completed" | "cancelled" | "pending";

export interface PaymentRecord {
  id?: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  note?: string;
  txnId?: string;
}

export interface Booking {
  id: string | number;
  turfId: string | number;
  turfName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string; // YYYY-MM-DD
  startHour: number;
  endHour: number;
  durationHours?: number;
  totalPrice: number;
  paidAmount: number;
  paymentHistory: PaymentRecord[];
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  txnId?: string;
  createdAt?: string;
}

export interface CreateBookingPayload {
  turfId: string | number;
  turfName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  startHour: number;
  endHour: number;
  durationHours: number;
  totalPrice: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  txnId?: string;
}

export interface RecordPaymentPayload {
  bookingId: string | number;
  amount: number;
  paymentMethod: PaymentMethod;
  txnId?: string;
  notes?: string;
}
