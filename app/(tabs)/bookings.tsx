import React, { useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Skeleton, Card } from "@/components/ui";
import { BookingCard } from "@/components/booking/BookingCard";
import { useBookings } from "@/hooks/queries/useBookings";

const STATUS_TABS = ["All", "Upcoming", "Partial Due", "Completed"];

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  const { data: bookings, isLoading, refetch, isRefetching } = useBookings();

  const filteredBookings = (bookings || []).filter((b) => {
    if (activeTab === "Upcoming") {
      return b.status === "confirmed" || b.status === "pending";
    }
    if (activeTab === "Partial Due") {
      return b.paymentStatus === "partial" || b.paymentStatus === "unpaid";
    }
    if (activeTab === "Completed") {
      return b.status === "completed" || b.status === "cancelled";
    }
    return true;
  });

  return (
    <ScreenWrapper className="pb-4">
      {/* Header */}
      <View className="my-3">
        <Text className="text-white text-2xl font-black">My Bookings</Text>
        <Text className="text-zinc-400 text-xs mt-0.5">
          Track reservations, schedules & payments
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row gap-2 mb-4">
        {STATUS_TABS.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full border ${
                isSelected
                  ? "bg-emerald-600 border-emerald-500"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? "text-white" : "text-zinc-400"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bookings List */}
      {isLoading ? (
        <View className="space-y-3">
          <Skeleton height={140} borderRadius={16} className="mb-3" />
          <Skeleton height={140} borderRadius={16} className="mb-3" />
          <Skeleton height={140} borderRadius={16} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onPress={(id) => router.push(`/booking/${id}` as any)}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <Card className="items-center justify-center py-12 bg-zinc-900/60">
              <Text className="text-4xl mb-3">📅</Text>
              <Text className="text-white font-bold text-base">
                No bookings found
              </Text>
              <Text className="text-zinc-500 text-xs mt-1 text-center px-4">
                You have no reservations matching "{activeTab}"
              </Text>
            </Card>
          }
        />
      )}
    </ScreenWrapper>
  );
}
