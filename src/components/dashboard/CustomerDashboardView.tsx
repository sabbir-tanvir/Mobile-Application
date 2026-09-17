import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Card, Badge, Skeleton } from "@/components/ui";
import { TurfCard } from "@/components/turf/TurfCard";
import { BookingCard } from "@/components/booking/BookingCard";
import type { Booking } from "@/api/types/booking.types";
import type { Turf } from "@/api/types/turf.types";
import type { Tournament } from "@/api/types/tournament.types";

interface CustomerDashboardViewProps {
  turfs: Turf[];
  turfsLoading: boolean;
  bookings: Booking[];
  tournaments: Tournament[];
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  turfs,
  turfsLoading,
  bookings,
  tournaments,
}) => {
  const router = useRouter();

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  );

  return (
    <View className="space-y-6">
      {/* Player Action Banner */}
      <Pressable
        onPress={() => router.push("/(tabs)/explore")}
        className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-5 shadow-lg shadow-emerald-950/40 active:opacity-95"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Badge label="Play Today" variant="success" size="sm" />
            <Text className="text-white text-xl font-black mt-2">
              Reserve Your Turf Slot
            </Text>
            <Text className="text-emerald-100/80 text-xs mt-1">
              Top quality football, cricket & badminton venues
            </Text>
          </View>
          <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
            <Text className="text-2xl">⚡</Text>
          </View>
        </View>
      </Pressable>

      {/* Next Upcoming Match Ticket */}
      {upcomingBookings.length > 0 && (
        <View>
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-white font-bold text-base">
              My Next Upcoming Game
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/bookings")}>
              <Text className="text-emerald-400 text-xs font-semibold">
                All Matches ({upcomingBookings.length}) →
              </Text>
            </Pressable>
          </View>
          <BookingCard
            booking={upcomingBookings[0]}
            onPress={(id) => router.push(`/booking/${id}` as any)}
          />
        </View>
      )}

      {/* Featured Turf Grounds */}
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white font-bold text-lg">Featured Grounds</Text>
          <Pressable onPress={() => router.push("/(tabs)/explore")}>
            <Text className="text-emerald-400 text-xs font-semibold">
              Explore All →
            </Text>
          </Pressable>
        </View>

        {turfsLoading ? (
          <View className="space-y-3">
            <Skeleton height={180} borderRadius={16} className="mb-3" />
            <Skeleton height={180} borderRadius={16} />
          </View>
        ) : turfs && turfs.length > 0 ? (
          turfs.slice(0, 3).map((turf) => (
            <TurfCard
              key={turf.id}
              turf={turf}
              onPress={(id) => router.push(`/turf/${id}` as any)}
            />
          ))
        ) : (
          <Card className="items-center justify-center py-8">
            <Text className="text-3xl mb-2">🏟️</Text>
            <Text className="text-zinc-300 font-semibold text-sm">
              No turfs found
            </Text>
          </Card>
        )}
      </View>
    </View>
  );
};
