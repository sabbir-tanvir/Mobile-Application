import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScreenWrapper,
  Card,
  Badge,
  Button,
  Input,
  Skeleton,
} from "@/components/ui";
import { PaymentHistory } from "@/components/booking/PaymentHistory";
import {
  useBooking,
  useRecordPayment,
  useCancelBooking,
} from "@/hooks/queries/useBookings";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { PaymentMethod } from "@/api/types/booking.types";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "bkash", label: "bKash", icon: "📱" },
  { id: "nagad", label: "Nagad", icon: "📲" },
  { id: "rocket", label: "Rocket", icon: "🚀" },
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "card", label: "Card", icon: "💳" },
];

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: booking, isLoading, error, refetch } = useBooking(id!);
  const recordPaymentMutation = useRecordPayment();
  const cancelBookingMutation = useCancelBooking();

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("bkash");
  const [txnId, setTxnId] = useState("");
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const remainingBalance = Math.max(
    0,
    (booking?.totalPrice || 0) - (booking?.paidAmount || 0)
  );

  const handleOpenPayment = () => {
    setPayAmount(String(remainingBalance));
    setShowPaymentForm(true);
  };

  const handleRecordPayment = async () => {
    const amountNum = parseFloat(payAmount);
    if (!amountNum || amountNum <= 0) {
      setErrorMessage("Please enter a valid payment amount");
      return;
    }

    if (amountNum > remainingBalance) {
      setErrorMessage(`Amount cannot exceed remaining balance (${formatTaka(remainingBalance)})`);
      return;
    }

    try {
      setErrorMessage("");
      await recordPaymentMutation.mutateAsync({
        bookingId: booking!.id,
        amount: amountNum,
        paymentMethod: payMethod,
        txnId: txnId ? txnId : undefined,
        notes: note ? note : undefined,
      });

      setShowPaymentForm(false);
      setTxnId("");
      setNote("");
      refetch();
      Alert.alert("Payment Recorded! ✅", `Successfully recorded ${formatTaka(amountNum)}.`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record payment");
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this reservation?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            await cancelBookingMutation.mutateAsync(booking!.id);
            refetch();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper className="p-4">
        <Skeleton height={200} borderRadius={16} className="mb-4" />
        <Skeleton height={140} borderRadius={16} className="mb-4" />
        <Skeleton height={100} borderRadius={16} />
      </ScreenWrapper>
    );
  }

  if (error || !booking) {
    return (
      <ScreenWrapper className="items-center justify-center p-6">
        <Text className="text-4xl mb-3">⚠️</Text>
        <Text className="text-white text-lg font-bold">Booking Not Found</Text>
        <Button
          title="Back to Bookings"
          onPress={() => router.back()}
          className="mt-4"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable className="pb-8">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between my-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
        >
          <Text className="text-white text-base font-bold">←</Text>
        </Pressable>
        <Text className="text-white font-bold text-base">Booking #{booking.id}</Text>
        <View className="w-10" />
      </View>

      {/* Main Status & Schedule Card */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white text-xl font-black flex-1 mr-2" numberOfLines={1}>
            {booking.turfName || "Turf Ground"}
          </Text>
          <Badge
            label={booking.status}
            variant={
              booking.status === "confirmed"
                ? "paid"
                : booking.status === "cancelled"
                ? "cancelled"
                : "pending"
            }
          />
        </View>

        <View className="space-y-1.5 mb-3">
          <Text className="text-zinc-400 text-xs">
            📅 Date:{" "}
            <Text className="text-zinc-200 font-semibold">
              {formatDate(booking.date)}
            </Text>
          </Text>
          <Text className="text-zinc-400 text-xs">
            ⏰ Time Slot:{" "}
            <Text className="text-zinc-200 font-semibold">
              {booking.startHour}:00 - {booking.endHour}:00
            </Text>
          </Text>
          <Text className="text-zinc-400 text-xs">
            👤 Customer:{" "}
            <Text className="text-zinc-200 font-semibold">
              {booking.customerName} ({booking.customerPhone})
            </Text>
          </Text>
        </View>
      </Card>

      {/* Financial Breakdown Card */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider">
            Payment Summary
          </Text>
          <Badge
            label={booking.paymentStatus}
            variant={
              booking.paymentStatus === "paid"
                ? "paid"
                : booking.paymentStatus === "partial"
                ? "partial"
                : "pending"
            }
          />
        </View>

        <View className="bg-zinc-950/80 rounded-xl p-3.5 border border-zinc-800/80 mb-3">
          <View className="flex-row justify-between py-1.5 border-b border-zinc-800/60">
            <Text className="text-zinc-400 text-sm">Total Booking Cost</Text>
            <Text className="text-white font-bold text-sm">
              {formatTaka(booking.totalPrice)}
            </Text>
          </View>

          <View className="flex-row justify-between py-1.5 border-b border-zinc-800/60">
            <Text className="text-zinc-400 text-sm">Total Paid So Far</Text>
            <Text className="text-emerald-400 font-bold text-sm">
              {formatTaka(booking.paidAmount)}
            </Text>
          </View>

          <View className="flex-row justify-between py-1.5">
            <Text className="text-zinc-400 text-sm font-semibold">
              Remaining Balance Due
            </Text>
            <Text
              className={`font-extrabold text-base ${
                remainingBalance > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {formatTaka(remainingBalance)}
            </Text>
          </View>
        </View>

        {/* CTA to Pay Remaining if balance exists */}
        {remainingBalance > 0 && !showPaymentForm && (
          <Button
            title={`💳 Pay Remaining Balance (${formatTaka(remainingBalance)})`}
            variant="primary"
            onPress={handleOpenPayment}
          />
        )}
      </Card>

      {/* Interactive Partial Payment Form */}
      {showPaymentForm && (
        <Card className="mb-4 bg-zinc-900 border-emerald-500/50 p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-bold text-base">
              Record Installment / Payment
            </Text>
            <Pressable onPress={() => setShowPaymentForm(false)}>
              <Text className="text-zinc-400 text-xs font-bold">Cancel ✕</Text>
            </Pressable>
          </View>

          {errorMessage ? (
            <View className="bg-red-500/15 border border-red-500/30 rounded-xl p-2.5 mb-3">
              <Text className="text-red-400 text-xs font-medium">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Input
            label="Payment Amount (৳)"
            value={payAmount}
            onChangeText={setPayAmount}
            keyboardType="numeric"
          />

          <Text className="text-zinc-400 text-xs mb-2">Payment Method</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = payMethod === method.id;
              return (
                <Pressable
                  key={method.id}
                  onPress={() => setPayMethod(method.id)}
                  className={`flex-row items-center px-3 py-1.5 rounded-xl border ${
                    isSelected
                      ? "bg-emerald-600 border-emerald-500"
                      : "bg-zinc-950 border-zinc-800"
                  }`}
                >
                  <Text className="mr-1 text-xs">{method.icon}</Text>
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {method.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="Transaction ID"
            placeholder="e.g. TRX123456"
            value={txnId}
            onChangeText={setTxnId}
            autoCapitalize="characters"
          />

          <Input
            label="Payment Note"
            placeholder="e.g. 2nd installment"
            value={note}
            onChangeText={setNote}
          />

          <Button
            title="Confirm Payment"
            variant="primary"
            loading={recordPaymentMutation.isPending}
            onPress={handleRecordPayment}
            className="mt-2"
          />
        </Card>
      )}

      {/* Payment History Log */}
      <Card className="mb-6 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-3">
          Payment Transactions
        </Text>
        <PaymentHistory history={booking.paymentHistory || []} />
      </Card>

      {/* Cancel Action */}
      {booking.status !== "cancelled" && booking.status !== "completed" && (
        <Button
          title="Cancel Reservation"
          variant="danger"
          onPress={handleCancelBooking}
          loading={cancelBookingMutation.isPending}
        />
      )}
    </ScreenWrapper>
  );
}
