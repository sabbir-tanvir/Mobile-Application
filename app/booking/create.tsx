import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper, Card, Button, Input, Badge } from "@/components/ui";
import { useTurf } from "@/hooks/queries/useTurfs";
import { useCreateBooking } from "@/hooks/queries/useBookings";
import { useAuthStore, selectUser } from "@/stores/auth.store";
import { formatTaka } from "@/lib/currency";
import { getTodayString } from "@/lib/date";
import type { PaymentMethod } from "@/api/types/booking.types";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "bkash", label: "bKash", icon: "📱" },
  { id: "nagad", label: "Nagad", icon: "📲" },
  { id: "rocket", label: "Rocket", icon: "🚀" },
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "card", label: "Card", icon: "💳" },
];

export default function CreateBookingScreen() {
  const router = useRouter();
  const { turfId } = useLocalSearchParams<{ turfId: string }>();
  const user = useAuthStore(selectUser);

  const { data: turf } = useTurf(turfId!);
  const createBookingMutation = useCreateBooking();

  // Form State
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [startHour, setStartHour] = useState(18); // default 6:00 PM
  const [durationHours, setDurationHours] = useState(1);
  const [customerName, setCustomerName] = useState(
    user?.fullName || user?.name || ""
  );
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");
  const [advanceAmount, setAdvanceAmount] = useState("500");
  const [txnId, setTxnId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const basePricePerHour = turf?.basePrice || 1000;
  const totalPrice = basePricePerHour * durationHours;
  const endHour = startHour + durationHours;

  const handleCreateBooking = async () => {
    if (!customerName || !customerPhone) {
      setErrorMessage("Please provide customer name and phone number");
      return;
    }

    const paidNum = parseFloat(advanceAmount) || 0;
    if (paidNum > totalPrice) {
      setErrorMessage("Paid amount cannot exceed total price");
      return;
    }

    try {
      setErrorMessage("");
      const created = await createBookingMutation.mutateAsync({
        turfId: turf?.id || turfId || 1,
        turfName: turf?.name || "Turf Ground",
        customerName,
        customerPhone,
        customerEmail: user?.email,
        date: selectedDate,
        startHour,
        endHour,
        durationHours,
        totalPrice,
        paidAmount: paidNum,
        paymentMethod,
        txnId: txnId ? txnId : undefined,
      });

      Alert.alert(
        "Booking Confirmed! 🎉",
        `Your reservation for ${turf?.name || "the turf"} is confirmed.`,
        [
          {
            text: "View Booking",
            onPress: () => router.replace(`/booking/${created.id}` as any),
          },
          {
            text: "My Bookings",
            onPress: () => router.replace("/(tabs)/bookings"),
          },
        ]
      );
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create booking");
    }
  };

  // Generate hour slots
  const opening = turf?.openingHour || 6;
  const closing = turf?.closingHour || 23;
  const availableHours: number[] = [];
  for (let h = opening; h < closing; h++) {
    availableHours.push(h);
  }

  return (
    <ScreenWrapper scrollable className="pb-8">
      {/* Header */}
      <View className="flex-row items-center justify-between my-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
        >
          <Text className="text-white text-base font-bold">←</Text>
        </Pressable>
        <Text className="text-white font-bold text-base">Book Slot</Text>
        <View className="w-10" />
      </View>

      {/* Turf Summary Card */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
          Reserving Ground
        </Text>
        <Text className="text-white text-xl font-black mt-0.5">
          {turf?.name || "Turf Arena"}
        </Text>
        <Text className="text-zinc-400 text-xs mt-0.5">
          Rate: {formatTaka(basePricePerHour)} / hour
        </Text>
      </Card>

      {errorMessage ? (
        <View className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 mb-4">
          <Text className="text-red-400 text-xs font-medium">
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {/* Slot Selection Card */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-zinc-300 text-xs uppercase font-bold tracking-wider mb-2">
          1. Select Time Slot
        </Text>

        <Text className="text-zinc-400 text-xs mb-2">Start Hour</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          <View className="flex-row gap-2">
            {availableHours.map((hour) => {
              const isSelected = startHour === hour;
              return (
                <Pressable
                  key={hour}
                  onPress={() => setStartHour(hour)}
                  className={`px-3 py-2 rounded-xl border ${
                    isSelected
                      ? "bg-emerald-600 border-emerald-500"
                      : "bg-zinc-950 border-zinc-800"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {hour}:00
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Text className="text-zinc-400 text-xs mb-2">Duration</Text>
        <View className="flex-row gap-3">
          {[1, 2, 3].map((dur) => (
            <Pressable
              key={dur}
              onPress={() => setDurationHours(dur)}
              className={`flex-1 py-2 rounded-xl border items-center justify-center ${
                durationHours === dur
                  ? "bg-emerald-600 border-emerald-500"
                  : "bg-zinc-950 border-zinc-800"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  durationHours === dur ? "text-white" : "text-zinc-400"
                }`}
              >
                {dur} Hour{dur > 1 ? "s" : ""}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="bg-zinc-950/80 rounded-xl p-3 mt-3 flex-row justify-between items-center border border-zinc-800/40">
          <Text className="text-zinc-400 text-xs">Selected Slot:</Text>
          <Text className="text-white font-bold text-xs">
            {startHour}:00 to {endHour}:00 ({durationHours} hr)
          </Text>
        </View>
      </Card>

      {/* Customer Info Card */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-zinc-300 text-xs uppercase font-bold tracking-wider mb-3">
          2. Customer Details
        </Text>

        <Input
          label="Your Name"
          placeholder="e.g. Karim Ahmed"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Input
          label="Contact Phone"
          placeholder="017XXXXXXXX"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
        />
      </Card>

      {/* Partial Payment Section */}
      <Card className="mb-6 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-zinc-300 text-xs uppercase font-bold tracking-wider mb-3">
          3. Payment & Advance
        </Text>

        {/* Pricing Summary */}
        <View className="flex-row justify-between mb-3 py-2 border-b border-zinc-800">
          <Text className="text-zinc-400 text-sm">Total Booking Amount</Text>
          <Text className="text-white font-extrabold text-base">
            {formatTaka(totalPrice)}
          </Text>
        </View>

        <Input
          label="Advance / Paid Amount (৳)"
          placeholder="500"
          value={advanceAmount}
          onChangeText={setAdvanceAmount}
          keyboardType="numeric"
        />

        {/* Remaining calculation */}
        <View className="flex-row justify-between mb-3 py-1">
          <Text className="text-zinc-400 text-xs">Remaining Balance Due</Text>
          <Text className="text-amber-400 font-bold text-xs">
            {formatTaka(
              Math.max(0, totalPrice - (parseFloat(advanceAmount) || 0))
            )}
          </Text>
        </View>

        {/* Payment Method Selector */}
        <Text className="text-zinc-400 text-xs mb-2">Payment Method</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = paymentMethod === method.id;
            return (
              <Pressable
                key={method.id}
                onPress={() => setPaymentMethod(method.id)}
                className={`flex-row items-center px-3 py-2 rounded-xl border ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-500"
                    : "bg-zinc-950 border-zinc-800"
                }`}
              >
                <Text className="mr-1.5">{method.icon}</Text>
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

        {paymentMethod !== "cash" && (
          <Input
            label="Transaction ID (Optional)"
            placeholder="e.g. TXN98765432"
            value={txnId}
            onChangeText={setTxnId}
            autoCapitalize="characters"
          />
        )}
      </Card>

      {/* Confirm Button */}
      <Button
        title={`Confirm & Reserve Slot (${formatTaka(totalPrice)})`}
        variant="primary"
        size="lg"
        loading={createBookingMutation.isPending}
        onPress={handleCreateBooking}
      />
    </ScreenWrapper>
  );
}
