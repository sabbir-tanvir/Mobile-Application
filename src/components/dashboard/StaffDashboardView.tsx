import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Card, Badge, Button } from "@/components/ui";
import { BookingCard } from "@/components/booking/BookingCard";
import { formatTaka } from "@/lib/currency";
import type { Booking } from "@/api/types/booking.types";

interface StaffDashboardViewProps {
  bookings: Booking[];
}

export const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({
  bookings,
}) => {
  const router = useRouter();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => b.date === todayStr);

  const partialDueBookings = bookings.filter(
    (b) => b.paymentStatus === "partial" || b.paymentStatus === "unpaid"
  );

  const totalDueAmount = partialDueBookings.reduce(
    (acc, b) => acc + Math.max(0, (b.totalPrice || 0) - (b.paidAmount || 0)),
    0
  );

  return (
    <View className="space-y-5">
      {/* Role Banner */}
      <View className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <Text className="text-2xl">🛠️</Text>
          <View>
            <Text className="text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              Field Operations & Staff
            </Text>
            <Text className="text-slate-600 dark:text-zinc-400 text-[11px]">
              Ground check-in, slots & cash collection
            </Text>
          </View>
        </View>
        <Badge label="Front Desk" variant="warning" size="sm" />
      </View>

      {/* Shift Overview Metrics */}
      <View className="flex-row gap-3">
        <Card className="flex-1 p-3.5">
          <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Today's Matches</Text>
          <Text className="text-slate-900 dark:text-white text-2xl font-black mt-1">
            {todayBookings.length}
          </Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">Scheduled Games</Text>
        </Card>

        <Card className="flex-1 p-3.5">
          <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Unpaid Dues</Text>
          <Text className="text-amber-600 dark:text-amber-400 text-2xl font-black mt-1">
            {partialDueBookings.length}
          </Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">
            Due: {formatTaka(totalDueAmount)}
          </Text>
        </Card>
      </View>

      {/* Front-desk Quick Actions */}
      <Card className="p-4">
        <Text className="text-slate-800 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider mb-3">
          Front-Desk Quick Actions
        </Text>
        <View className="space-y-2.5">
          <View className="flex-row gap-2.5">
            <Button
              title="+ Walk-in Booking"
              variant="primary"
              size="sm"
              onPress={() => router.push("/booking/create" as any)}
              className="flex-1"
            />
            <Button
              title="💳 Payments"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/payments" as any)}
              className="flex-1"
            />
          </View>
          <View className="flex-row gap-2.5">
            <Button
              title="👥 Players"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/customers" as any)}
              className="flex-1"
            />
            <Button
              title="🛍️ Sales POS"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/pos" as any)}
              className="flex-1"
            />
          </View>
        </View>
      </Card>

      {/* Today's Scheduled Matches */}
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-900 dark:text-white font-black text-base">
            Today's Schedule ({todayStr})
          </Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">
            {todayBookings.length} bookings
          </Text>
        </View>

        {todayBookings.length > 0 ? (
          todayBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPress={(id) => router.push(`/booking/${id}` as any)}
            />
          ))
        ) : (
          <Card variant="surface" className="p-6 items-center justify-center">
            <Text className="text-3xl mb-1">⏰</Text>
            <Text className="text-slate-700 dark:text-zinc-300 font-bold text-sm">
              No matches scheduled for today
            </Text>
            <Text className="text-slate-500 dark:text-zinc-500 text-xs mt-0.5 text-center">
              Walk-in customers can be booked instantly using the button above.
            </Text>
          </Card>
        )}
      </View>

      {/* Pending Balance Warning List */}
      {partialDueBookings.length > 0 && (
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-amber-600 dark:text-amber-400 font-extrabold text-sm uppercase tracking-wider">
              ⚠️ Attention Needed: Pending Balances
            </Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">
              {partialDueBookings.length} dues
            </Text>
          </View>

          {partialDueBookings.slice(0, 3).map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPress={(id) => router.push(`/booking/${id}` as any)}
            />
          ))}
        </View>
      )}
    </View>
  );
};
