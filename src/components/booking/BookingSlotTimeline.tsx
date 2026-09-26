import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Card, Badge } from "@/components/ui";
import { formatTaka } from "@/lib/currency";
import type { Booking } from "@/api/types/booking.types";
import type { Turf } from "@/api/types/turf.types";

interface BookingSlotTimelineProps {
  selectedDate: string; // YYYY-MM-DD
  turfs: Turf[];
  selectedTurfId: string | number | "all";
  bookings: Booking[];
  onSelectEmptySlot: (turfId: string | number, date: string, startHour: number) => void;
  onSelectBooking: (bookingId: string | number) => void;
}

export const BookingSlotTimeline: React.FC<BookingSlotTimelineProps> = ({
  selectedDate,
  turfs,
  selectedTurfId,
  bookings,
  onSelectEmptySlot,
  onSelectBooking,
}) => {
  // Determine relevant turfs
  const targetTurfs =
    selectedTurfId === "all"
      ? turfs
      : turfs.filter((t) => String(t.id) === String(selectedTurfId));

  // Determine earliest open and latest close hour across target turfs
  const minHour = targetTurfs.reduce(
    (min, t) => Math.min(min, t.openingHour ?? 6),
    6
  );
  const maxHour = targetTurfs.reduce(
    (max, t) => Math.max(max, t.closingHour ?? 23),
    23
  );

  const hours: number[] = [];
  for (let h = minHour; h <= maxHour; h += 1.5) {
    if (h + 1.5 <= maxHour + 1) { // Ensure the last slot fits within the closing time boundary roughly
      hours.push(h);
    }
  }

  const formatHourLabel = (h: number) => {
    const isPM = h >= 12 && h < 24;
    const period = isPM ? "PM" : "AM";
    const displayHour = Math.floor(h) % 12 || 12;
    const minutes = h % 1 === 0.5 ? "30" : "00";
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <View className="space-y-3">
      {hours.map((hour) => {
        return (
          <View key={hour} className="flex-row items-start gap-2.5">
            {/* Time Indicator Column */}
            <View className="w-16 pt-2 items-end">
              <Text className="text-slate-500 dark:text-zinc-400 text-xs font-bold font-mono">
                {formatHourLabel(hour)}
              </Text>
            </View>

            {/* Turf Slots Column */}
            <View className="flex-1 space-y-2">
              {targetTurfs.map((turf) => {
                // Find if there is an active booking for this turf on this date and hour
                const matchingBooking = bookings.find(
                  (b) =>
                    String(b.turfId) === String(turf.id) &&
                    b.date === selectedDate &&
                    b.status !== "cancelled" &&
                    hour >= b.startHour &&
                    hour < b.endHour
                );

                if (matchingBooking) {
                  const duration = matchingBooking.endHour - matchingBooking.startHour;

                  return (
                    <Pressable
                      key={`${turf.id}-${hour}`}
                      onPress={() => onSelectBooking(matchingBooking.id)}
                      className="active:opacity-80"
                    >
                      <Card
                        variant="elevated"
                        className={`p-3 border rounded-2xl shadow-sm ${
                          matchingBooking.status === "completed"
                            ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-600/50"
                            : matchingBooking.status === "confirmed"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-600/50"
                            : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-600/50"
                        }`}
                      >
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                            <Text className="text-slate-900 dark:text-white font-bold text-xs" numberOfLines={1}>
                              👤 {matchingBooking.customerName}
                            </Text>
                            {targetTurfs.length > 1 && (
                              <Text className="text-slate-500 dark:text-zinc-400 text-[10px]" numberOfLines={1}>
                                • {turf.name}
                              </Text>
                            )}
                          </View>
                          <Badge
                            label={matchingBooking.paymentStatus}
                            variant={
                              matchingBooking.paymentStatus === "paid"
                                ? "paid"
                                : matchingBooking.paymentStatus === "partial"
                                ? "partial"
                                : "pending"
                            }
                            size="sm"
                          />
                        </View>

                        <View className="flex-row items-center justify-between">
                          <Text className="text-slate-700 dark:text-zinc-300 text-[11px] font-medium">
                            ⏰ {formatHourLabel(matchingBooking.startHour)} - {formatHourLabel(matchingBooking.endHour)} ({duration}h)
                          </Text>
                          <Text className="text-slate-500 dark:text-zinc-400 text-[10px]">
                            {matchingBooking.customerPhone}
                          </Text>
                        </View>
                      </Card>
                    </Pressable>
                  );
                }

                // Empty / Available Slot
                const isPeak =
                  turf.peakHoursStart &&
                  turf.peakHoursEnd &&
                  hour >= turf.peakHoursStart &&
                  hour < turf.peakHoursEnd;
                const isNight = hour >= 20;
                const baseRate = isNight
                  ? turf.nightPrice || turf.basePrice
                  : isPeak
                  ? turf.peakPrice || turf.basePrice
                  : turf.basePrice;
                const rate = baseRate * 1.5; // Multiply by 1.5 since the slot is 90 mins

                return (
                  <Pressable
                    key={`${turf.id}-${hour}`}
                    onPress={() => onSelectEmptySlot(turf.id, selectedDate, hour)}
                    className="active:opacity-75"
                  >
                    <View className="p-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-sm shadow-slate-100 dark:shadow-none flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <Text className="text-slate-700 dark:text-zinc-300 text-xs font-semibold">
                          Available Slot
                        </Text>
                        {targetTurfs.length > 1 && (
                          <Text className="text-slate-400 dark:text-zinc-500 text-[10px]">
                            ({turf.name})
                          </Text>
                        )}
                      </View>

                      <View className="flex-row items-center gap-2">
                        <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          {formatTaka(rate)}
                        </Text>
                        <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-xs bg-emerald-500/15 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          + Book
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};
