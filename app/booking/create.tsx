import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper, Card, Button, Input, Badge } from "@/components/ui";
import { useTurf, useTurfs } from "@/hooks/queries/useTurfs";
import { useCreateBooking, useBookings } from "@/hooks/queries/useBookings";
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
  const { turfId: paramTurfId, date: paramDate, startHour: paramStartHour } =
    useLocalSearchParams<{
      turfId?: string;
      date?: string;
      startHour?: string;
    }>();

  const user = useAuthStore(selectUser);

  const { data: allTurfs = [] } = useTurfs();
  const [selectedTurfId, setSelectedTurfId] = useState<string | number>(
    paramTurfId || ""
  );

  useEffect(() => {
    if (!selectedTurfId && allTurfs.length > 0) {
      setSelectedTurfId(allTurfs[0].id);
    }
  }, [allTurfs, selectedTurfId]);

  const { data: currentTurf } = useTurf(selectedTurfId || paramTurfId || "");
  const { data: allBookings = [] } = useBookings();
  const createBookingMutation = useCreateBooking();

  // Form State
  const [selectedDate, setSelectedDate] = useState(paramDate || getTodayString());
  const [startHour, setStartHour] = useState(
    paramStartHour ? parseFloat(paramStartHour) : 18
  );
  const [durationHours, setDurationHours] = useState(1.5);
  const [customerName, setCustomerName] = useState(
    user?.fullName || user?.name || ""
  );
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");
  const [advanceAmount, setAdvanceAmount] = useState("500");
  const [txnId, setTxnId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const endHour = startHour + durationHours;

  const formatTime = (h: number) => {
    const isPM = h >= 12 && h < 24;
    const period = isPM ? "PM" : "AM";
    const hour12 = Math.floor(h) % 12 || 12;
    const minutes = h % 1 === 0.5 ? "30" : "00";
    return `${hour12}:${minutes} ${period}`;
  };

  // Accurate Rate calculation considering peak & night hours (per 1.5hr slot)
  const calculateRate = () => {
    if (!currentTurf) return 1500 * (durationHours / 1.5);
    let sum = 0;
    for (let h = startHour; h < endHour; h += 1.5) {
      const isPeak =
        currentTurf.peakHoursStart &&
        currentTurf.peakHoursEnd &&
        h >= currentTurf.peakHoursStart &&
        h < currentTurf.peakHoursEnd;
      const isNight = h >= 20;

      let slotPrice = currentTurf.basePrice;
      if (isNight) {
        slotPrice = currentTurf.nightPrice || currentTurf.basePrice;
      } else if (isPeak) {
        slotPrice = currentTurf.peakPrice || currentTurf.basePrice;
      }
      
      // Price in DB is per hour, slot is 1.5 hours
      sum += slotPrice * 1.5;
    }
    return sum;
  };

  const totalPrice = calculateRate();

  // Real-time conflict validation
  const existingTurfBookings = allBookings.filter(
    (b) =>
      String(b.turfId) === String(selectedTurfId) &&
      b.date === selectedDate &&
      b.status !== "cancelled"
  );

  const conflictingBooking = existingTurfBookings.find((b) => {
    return (
      (startHour >= b.startHour && startHour < b.endHour) ||
      (endHour > b.startHour && endHour <= b.endHour) ||
      (startHour <= b.startHour && endHour >= b.endHour)
    );
  });

  const handleCreateBooking = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage("Please enter customer name and phone number");
      return;
    }

    if (conflictingBooking) {
      setErrorMessage(
        `Slot conflict: ${conflictingBooking.customerName} has already reserved this ground from ${formatTime(conflictingBooking.startHour)} to ${formatTime(conflictingBooking.endHour)}`
      );
      return;
    }

    const paidNum = parseFloat(advanceAmount) || 0;
    if (paidNum > totalPrice) {
      setErrorMessage("Paid advance cannot exceed total booking price");
      return;
    }

    try {
      setErrorMessage("");
      const created = await createBookingMutation.mutateAsync({
        turfId: currentTurf?.id || selectedTurfId,
        turfName: currentTurf?.name || "Turf Ground",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: user?.email,
        date: selectedDate,
        startHour,
        endHour,
        durationHours,
        totalPrice,
        paidAmount: paidNum,
        paymentMethod,
        txnId: txnId.trim() ? txnId.trim() : undefined,
      });

      if (Platform.OS === "web") {
        window.alert(`Booking Confirmed! Slot reserved for ${currentTurf?.name || "Turf"}.`);
        router.replace(`/booking/${created.id}` as any);
      } else {
        Alert.alert(
          "Booking Confirmed! 🎉",
          `Your reservation for ${currentTurf?.name || "the turf"} is confirmed.`,
          [
            {
              text: "View Details",
              onPress: () => router.replace(`/booking/${created.id}` as any),
            },
            {
              text: "My Bookings",
              onPress: () => router.replace("/(tabs)/bookings"),
            },
          ]
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create booking");
    }
  };

  // Generate 1.5-hour slots
  const opening = currentTurf?.openingHour ?? 6;
  const closing = currentTurf?.closingHour ?? 23;
  const availableHours: number[] = [];
  for (let h = opening; h < closing; h += 1.5) {
    if (h + 1.5 <= closing + 1) { // Allow up to 1 hr past closing if needed to complete a 1.5 slot
      availableHours.push(h);
    }
  }

  return (
    <ScreenWrapper scrollable className="pb-10">
      {/* Header */}
      <View className="flex-row items-center justify-between my-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center shadow-sm shadow-slate-200/50 dark:shadow-none active:scale-95"
        >
          <Text className="text-slate-800 dark:text-white text-base font-bold">←</Text>
        </Pressable>
        <Text className="text-slate-900 dark:text-white font-black text-base">New Slot Reservation</Text>
        <View className="w-10" />
      </View>

      {errorMessage ? (
        <View className="bg-rose-50 dark:bg-red-500/15 border border-rose-200 dark:border-red-500/30 rounded-2xl p-3 mb-4">
          <Text className="text-rose-600 dark:text-red-400 text-xs font-medium">{errorMessage}</Text>
        </View>
      ) : null}

      {/* Turf Selector if multiple turfs available */}
      {allTurfs.length > 1 && (
        <Card className="mb-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
          <Text className="text-slate-400 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            Select Pitch / Ground
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {allTurfs.map((t) => {
              const isSelected = String(t.id) === String(selectedTurfId);
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setSelectedTurfId(t.id)}
                  className={`px-3.5 py-2 rounded-xl border ${
                    isSelected
                      ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                      : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>
      )}

      {/* Pitch Summary Card */}
      {currentTurf && (
        <Card className="mb-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-slate-900 dark:text-white font-black text-lg">{currentTurf.name}</Text>
              <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">
                📍 {currentTurf.location || "Pitch Ground"} • {currentTurf.type}
              </Text>
            </View>
            <Badge label={`৳${currentTurf.basePrice}/hr`} variant="paid" size="sm" />
          </View>
        </Card>
      )}

      {/* Schedule & Slot Selector */}
      <Card className="mb-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
        <Text className="text-slate-900 dark:text-white font-bold text-base mb-3">Schedule Slot</Text>

        <Input
          label="Match Date (YYYY-MM-DD)"
          placeholder="2026-09-23"
          value={selectedDate}
          onChangeText={setSelectedDate}
        />

        {/* Start Hour Selector Chips */}
        <Text className="text-slate-500 dark:text-zinc-400 text-xs mb-2 font-medium">Start Time Slot</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
          {availableHours.map((hour) => {
            const isSelected = startHour === hour;
            const isBooked = existingTurfBookings.some(
              (b) => hour >= b.startHour && hour < b.endHour
            );

            return (
              <Pressable
                key={hour}
                disabled={isBooked}
                onPress={() => setStartHour(hour)}
                className={`px-3 py-2 rounded-xl border items-center justify-center ${
                  isBooked
                    ? "bg-slate-100 dark:bg-zinc-950/80 border-rose-200 dark:border-red-950 opacity-50"
                    : isSelected
                    ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                    : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isBooked
                      ? "text-rose-500 dark:text-red-400 line-through"
                      : isSelected
                      ? "text-white"
                      : "text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  {formatTime(hour)}
                </Text>
                {isBooked && (
                  <Text className="text-[9px] text-rose-500 dark:text-red-400 font-semibold mt-0.5">
                    Booked
                  </Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Duration Selector */}
        <Text className="text-slate-500 dark:text-zinc-400 text-xs mb-2 font-medium">Duration</Text>
        <View className="flex-row gap-2 mb-2">
          {[1.5, 3, 4.5].map((hours) => {
            const isSelected = durationHours === hours;
            return (
              <Pressable
                key={hours}
                onPress={() => setDurationHours(hours)}
                className={`flex-1 py-2 rounded-xl border items-center justify-center ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                    : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {hours} Hours
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Conflict Warning Banner if slot overlaps */}
        {conflictingBooking && (
          <View className="mt-2 bg-rose-50 dark:bg-red-500/15 border border-rose-200 dark:border-red-500/40 rounded-xl p-3 flex-row items-center gap-2">
            <Text className="text-base">⚠️</Text>
            <Text className="text-rose-600 dark:text-red-400 text-xs flex-1 font-medium">
              Overlaps with an existing reservation by {conflictingBooking.customerName} (
              {formatTime(conflictingBooking.startHour)} - {formatTime(conflictingBooking.endHour)}).
            </Text>
          </View>
        )}
      </Card>

      {/* Customer Info Card */}
      <Card className="mb-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
        <Text className="text-slate-900 dark:text-white font-bold text-base mb-3">Player / Customer Details</Text>

        <Input
          label="Customer Full Name *"
          placeholder="e.g. Tanvir Rahman"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Input
          label="Phone Number *"
          placeholder="017XXXXXXXX"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
        />
      </Card>

      {/* Payment & Advance Amount Card */}
      <Card className="mb-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
        <Text className="text-slate-900 dark:text-white font-bold text-base mb-3">Payment Summary</Text>

        <View className="bg-slate-50 dark:bg-zinc-950/80 rounded-xl p-3.5 border border-slate-200/80 dark:border-zinc-800/80 mb-3">
          <View className="flex-row justify-between py-1">
            <Text className="text-slate-500 dark:text-zinc-400 text-xs">Slot Window</Text>
            <Text className="text-slate-800 dark:text-zinc-200 font-semibold text-xs">
              {formatTime(startHour)} - {formatTime(endHour)} ({durationHours}h)
            </Text>
          </View>
          <View className="flex-row justify-between py-1.5 border-t border-slate-200/60 dark:border-zinc-800/60 mt-1">
            <Text className="text-slate-700 dark:text-zinc-400 text-sm font-semibold">Total Price</Text>
            <Text className="text-emerald-600 dark:text-emerald-400 font-black text-base">
              {formatTaka(totalPrice)}
            </Text>
          </View>
        </View>

        <Input
          label="Advance Deposit Amount (৳)"
          value={advanceAmount}
          onChangeText={setAdvanceAmount}
          keyboardType="numeric"
        />

        {/* Payment Method Selector */}
        <Text className="text-slate-500 dark:text-zinc-400 text-xs mb-2 font-medium">Payment Channel</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {PAYMENT_METHODS.map((m) => {
            const isSelected = paymentMethod === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setPaymentMethod(m.id)}
                className={`flex-row items-center px-3.5 py-2 rounded-xl border ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                    : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                }`}
              >
                <Text className="mr-1.5 text-xs">{m.icon}</Text>
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label="Transaction ID (Optional)"
          placeholder="e.g. TRX12345678"
          value={txnId}
          onChangeText={setTxnId}
          autoCapitalize="characters"
        />
      </Card>

      {/* Submit Button */}
      <Button
        title={
          createBookingMutation.isPending
            ? "Reserving..."
            : conflictingBooking
            ? "Slot Not Available"
            : `Confirm Reservation (${formatTaka(totalPrice)})`
        }
        variant={conflictingBooking ? "secondary" : "primary"}
        size="lg"
        disabled={Boolean(conflictingBooking) || createBookingMutation.isPending}
        loading={createBookingMutation.isPending}
        onPress={handleCreateBooking}
        className="w-full"
      />
    </ScreenWrapper>
  );
}
