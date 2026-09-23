import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/api/bookings.api";
import type {
  Booking,
  CreateBookingPayload,
  RecordPaymentPayload,
} from "@/api/types/booking.types";

export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (params?: Record<string, any>) =>
    [...bookingKeys.lists(), params ?? {}] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...bookingKeys.details(), String(id)] as const,
};

export function useBookings(params?: Record<string, any>) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingsApi.list(params),
  });
}

export function useBooking(id: string | number) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) =>
      bookingsApi.recordPayment(payload),
    onSuccess: (updatedBooking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.setQueryData(
        bookingKeys.detail(updatedBooking.id),
        updatedBooking
      );
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => bookingsApi.cancel(id),
    onSuccess: (updatedBooking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.setQueryData(
        bookingKeys.detail(updatedBooking.id),
        updatedBooking
      );
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string | number;
      status: Booking["status"];
    }) => bookingsApi.update(id, { status }),
    onSuccess: (updatedBooking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.setQueryData(
        bookingKeys.detail(updatedBooking.id),
        updatedBooking
      );
    },
  });
}

