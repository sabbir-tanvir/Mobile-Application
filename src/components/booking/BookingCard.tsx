import React from "react";
import { View, Text, Pressable } from "react-native";
import { Card, Badge } from "@/components/ui";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { Booking } from "@/api/types/booking.types";

export interface BookingCardProps {
  booking: Booking;
  onPress: (id: string | number) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const remainingBalance = Math.max(
    0,
    (booking.totalPrice || 0) - (booking.paidAmount || 0)
  );

  return (
    <Pressable
      onPress={() => onPress(booking.id)}
      className="mb-3.5 active:scale-[0.99]"
    >
      <Card className="bg-zinc-900 border-zinc-800">
        {/* Header row: Turf Name + Payment Status Badge */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white font-bold text-base flex-1 mr-2" numberOfLines={1}>
            {booking.turfName || `Turf #${booking.turfId}`}
          </Text>
          <Badge
            label={booking.paymentStatus || "unpaid"}
            variant={
              booking.paymentStatus === "paid"
                ? "paid"
                : booking.paymentStatus === "partial"
                ? "partial"
                : "pending"
            }
            size="sm"
          />
        </View>

        {/* Date & Time slot */}
        <View className="flex-row items-center gap-3 mb-3">
          <Text className="text-zinc-400 text-xs font-medium">
            📅 {formatDate(booking.date)}
          </Text>
          <Text className="text-zinc-500 text-xs">•</Text>
          <Text className="text-zinc-400 text-xs font-medium">
            ⏰ {booking.startHour}:00 - {booking.endHour}:00
          </Text>
        </View>

        {/* Price & Balance breakdown */}
        <View className="bg-zinc-950/60 rounded-xl p-2.5 flex-row justify-between items-center border border-zinc-800/40">
          <View>
            <Text className="text-zinc-500 text-[10px] uppercase font-semibold">
              Total Price
            </Text>
            <Text className="text-zinc-200 font-bold text-sm">
              {formatTaka(booking.totalPrice)}
            </Text>
          </View>

          <View className="items-center">
            <Text className="text-zinc-500 text-[10px] uppercase font-semibold">
              Paid
            </Text>
            <Text className="text-emerald-400 font-bold text-sm">
              {formatTaka(booking.paidAmount)}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-zinc-500 text-[10px] uppercase font-semibold">
              Remaining
            </Text>
            <Text
              className={`font-bold text-sm ${
                remainingBalance > 0 ? "text-amber-400" : "text-zinc-400"
              }`}
            >
              {formatTaka(remainingBalance)}
            </Text>
          </View>
        </View>

        {/* Action hint */}
        <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-zinc-800/60">
          <Text className="text-zinc-500 text-[11px]">
            Customer: {booking.customerName}
          </Text>
          <Text className="text-emerald-400 text-xs font-semibold">
            Details & Pay →
          </Text>
        </View>
      </Card>
    </Pressable>
  );
};
