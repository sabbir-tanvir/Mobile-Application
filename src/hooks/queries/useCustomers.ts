import { useMemo } from "react";
import { useBookings } from "./useBookings";
import type { Booking } from "@/api/types/booking.types";

export interface CustomerProfile {
  name: string;
  phone: string;
  email?: string;
  bookingsCount: number;
  totalSpent: number;
  unpaidDues: number;
  lastBookingDate?: string;
  tier: "VIP" | "Regular" | "New";
  bookings: Booking[];
}

export function useCustomers() {
  const { data: bookings = [], isLoading, isRefetching, refetch } = useBookings();

  const customers = useMemo(() => {
    const map: Record<string, CustomerProfile> = {};

    bookings.forEach((b) => {
      const phone = b.customerPhone?.trim();
      if (!phone) return;

      if (!map[phone]) {
        map[phone] = {
          name: b.customerName?.trim() || "Unknown Player",
          phone,
          email: b.customerEmail?.trim() || undefined,
          bookingsCount: 0,
          totalSpent: 0,
          unpaidDues: 0,
          lastBookingDate: b.date,
          tier: "New",
          bookings: [],
        };
      }

      const item = map[phone];
      item.bookingsCount += 1;
      item.totalSpent += b.totalPrice || 0;
      item.bookings.push(b);

      if (b.paymentStatus !== "paid") {
        item.unpaidDues += Math.max(0, (b.totalPrice || 0) - (b.paidAmount || 0));
      }

      if (b.date && (!item.lastBookingDate || b.date > item.lastBookingDate)) {
        item.lastBookingDate = b.date;
      }
      if (b.customerName && (!item.name || item.name === "Unknown Player")) {
        item.name = b.customerName.trim();
      }
      if (b.customerEmail && !item.email) {
        item.email = b.customerEmail.trim();
      }
    });

    // Compute tier and sort by total bookings descending
    const list = Object.values(map).map((c) => {
      let tier: "VIP" | "Regular" | "New" = "New";
      if (c.bookingsCount >= 10) tier = "VIP";
      else if (c.bookingsCount >= 5) tier = "Regular";
      return { ...c, tier };
    });

    return list.sort((a, b) => b.bookingsCount - a.bookingsCount);
  }, [bookings]);

  return {
    data: customers,
    isLoading,
    isRefetching,
    refetch,
  };
}

export function useCustomerByPhone(phone?: string) {
  const { data: customers, isLoading } = useCustomers();
  const customer = useMemo(() => {
    if (!phone) return null;
    const decoded = decodeURIComponent(phone).trim();
    return customers.find((c) => c.phone === decoded) || null;
  }, [customers, phone]);

  return {
    customer,
    isLoading,
  };
}
