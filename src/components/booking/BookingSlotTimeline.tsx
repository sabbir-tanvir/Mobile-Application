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
  for (let h = minHour; h <= maxHour; h++) {
    hours.push(h);
  }

  const formatHourLabel = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <View className="space-y-3">
      {hours.map((hour) => {
        return (
          <View key={hour} className="flex-row items-start gap-2.5">
            {/* Time Indicator Column */}
            <View className="w-16 pt-2 items-end">
              <Text className="text-zinc-400 text-xs font-bold font-mono">
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
                  const isBookingStart = hour === matchingBooking.startHour;
                  const duration = matchingBooking.endHour - matchingBooking.startHour;

                  return (
                    <Pressable
                      key={`${turf.id}-${hour}`}
                      onPress={() => onSelectBooking(matchingBooking.id)}
                      className="active:opacity-80"
                    >
                      <Card
                        className={`p-3 border ${
                          matchingBooking.status === "completed"
                            ? "bg-blue-950/40 border-blue-600/50"
                            : matchingBooking.status === "confirmed"
                            ? "bg-emerald-950/30 border-emerald-600/50"
                            : "bg-amber-950/30 border-amber-600/50"
                        }`}
                      >
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                            <Text className="text-white font-bold text-xs" numberOfLines={1}>
                              👤 {matchingBooking.customerName}
                            </Text>
                            {targetTurfs.length > 1 && (
                              <Text className="text-zinc-400 text-[10px]" numberOfLines={1}>
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
                          <Text className="text-zinc-300 text-[11px]">
                            ⏰ {matchingBooking.startHour}:00 - {matchingBooking.endHour}:00 ({duration}h)
                          </Text>
                          <Text className="text-zinc-400 text-[10px]">
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
                const rate = isNight
                  ? turf.nightPrice || turf.basePrice
                  : isPeak
                  ? turf.peakPrice || turf.basePrice
                  : turf.basePrice;

                return (
                  <Pressable
                    key={`${turf.id}-${hour}`}
                    onPress={() => onSelectEmptySlot(turf.id, selectedDate, hour)}
                    className="active:opacity-75"
                  >
                    <View className="p-2.5 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-emerald-500" />
                        <Text className="text-zinc-300 text-xs font-semibold">
                          Available Slot
                        </Text>
                        {targetTurfs.length > 1 && (
                          <Text className="text-zinc-500 text-[10px]">
                            ({turf.name})
                          </Text>
                        )}
                      </View>

                      <View className="flex-row items-center gap-2">
                        <Text className="text-emerald-400 font-bold text-xs">
                          {formatTaka(rate)}
                        </Text>
                        <Text className="text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-md">
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
