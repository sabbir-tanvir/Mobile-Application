import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Skeleton, Card, Button } from "@/components/ui";
import { BookingCard, BookingSlotTimeline } from "@/components/booking";
import { useBookings } from "@/hooks/queries/useBookings";
import { useTurfs } from "@/hooks/queries/useTurfs";
import { getTodayString } from "@/lib/date";

const STATUS_TABS = ["All", "Upcoming", "Partial Due", "Completed"];

export default function BookingsScreen() {
  const router = useRouter();

  // State
  const [viewMode, setViewMode] = useState<"list" | "timeline">("timeline");
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedTurfId, setSelectedTurfId] = useState<string | number | "all">("all");

  const { data: bookings = [], isLoading: loadingBookings, refetch, isRefetching } = useBookings();
  const { data: turfs = [], isLoading: loadingTurfs } = useTurfs();

  const isLoading = loadingBookings || loadingTurfs;

  // Filtered bookings for List View
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !searchQuery ||
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone?.includes(searchQuery) ||
      b.turfName?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab === "Upcoming") {
      matchesTab = b.status === "confirmed" || b.status === "pending";
    } else if (activeTab === "Partial Due") {
      matchesTab = b.paymentStatus === "partial" || b.paymentStatus === "unpaid";
    } else if (activeTab === "Completed") {
      matchesTab = b.status === "completed" || b.status === "cancelled";
    }

    return matchesSearch && matchesTab;
  });

  // Date Navigation Helpers
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const isToday = selectedDate === getTodayString();

  return (
    <ScreenWrapper className="pb-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <View>
          <Text className="text-white text-2xl font-black">Bookings & Schedule</Text>
          <Text className="text-zinc-400 text-xs mt-0.5">
            {bookings.length} reservations across all pitches
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/booking/create" as any)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 border border-emerald-500 shadow-md shadow-emerald-950 flex-row items-center"
        >
          <Text className="text-white font-bold text-xs">+ Book Slot</Text>
        </Pressable>
      </View>

      {/* View Switcher: List vs Timeline */}
      <View className="flex-row bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-3.5">
        <Pressable
          onPress={() => setViewMode("timeline")}
          className={`flex-1 py-2 rounded-lg items-center justify-center flex-row gap-1.5 ${
            viewMode === "timeline" ? "bg-emerald-600 shadow-sm" : "bg-transparent"
          }`}
        >
          <Text className="text-sm">⏱️</Text>
          <Text
            className={`text-xs font-bold ${
              viewMode === "timeline" ? "text-white" : "text-zinc-400"
            }`}
          >
            24h Slot Matrix
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode("list")}
          className={`flex-1 py-2 rounded-lg items-center justify-center flex-row gap-1.5 ${
            viewMode === "list" ? "bg-emerald-600 shadow-sm" : "bg-transparent"
          }`}
        >
          <Text className="text-sm">📋</Text>
          <Text
            className={`text-xs font-bold ${
              viewMode === "list" ? "text-white" : "text-zinc-400"
            }`}
          >
            Reservations List
          </Text>
        </Pressable>
      </View>

      {/* TIMELINE / SLOT MATRIX VIEW */}
      {viewMode === "timeline" ? (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Date Selector Navigation Bar */}
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-3.5 flex-row items-center justify-between">
            <Pressable
              onPress={() => shiftDate(-1)}
              className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 items-center justify-center active:bg-zinc-800"
            >
              <Text className="text-white font-bold text-xs">◀</Text>
            </Pressable>

            <View className="items-center">
              <Text className="text-white font-black text-sm">
                📅 {selectedDate}
              </Text>
              <View className="flex-row gap-2 mt-1">
                <Pressable
                  onPress={() => setSelectedDate(getTodayString())}
                  className={`px-2 py-0.5 rounded-md border ${
                    isToday
                      ? "bg-emerald-500/20 border-emerald-500"
                      : "bg-zinc-950 border-zinc-800"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      isToday ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  >
                    Today
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    const tom = new Date();
                    tom.setDate(tom.getDate() + 1);
                    setSelectedDate(tom.toISOString().split("T")[0]);
                  }}
                  className="px-2 py-0.5 rounded-md border bg-zinc-950 border-zinc-800"
                >
                  <Text className="text-zinc-400 text-[10px] font-semibold">
                    Tomorrow
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={() => shiftDate(1)}
              className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 items-center justify-center active:bg-zinc-800"
            >
              <Text className="text-white font-bold text-xs">▶</Text>
            </Pressable>
          </View>

          {/* Turf Filter Chips for Timeline */}
          {turfs.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-2 mb-3.5"
            >
              <Pressable
                onPress={() => setSelectedTurfId("all")}
                className={`px-3 py-1.5 rounded-full border ${
                  selectedTurfId === "all"
                    ? "bg-emerald-600 border-emerald-500"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    selectedTurfId === "all" ? "text-white" : "text-zinc-400"
                  }`}
                >
                  All Pitches
                </Text>
              </Pressable>

              {turfs.map((t) => {
                const isSelected = String(selectedTurfId) === String(t.id);
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setSelectedTurfId(t.id)}
                    className={`px-3 py-1.5 rounded-full border ${
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
                      {t.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {/* Timeline Matrix Component */}
          {isLoading ? (
            <View className="space-y-3">
              <Skeleton height={60} borderRadius={12} />
              <Skeleton height={60} borderRadius={12} />
              <Skeleton height={60} borderRadius={12} />
              <Skeleton height={60} borderRadius={12} />
            </View>
          ) : (
            <BookingSlotTimeline
              selectedDate={selectedDate}
              turfs={turfs}
              selectedTurfId={selectedTurfId}
              bookings={bookings}
              onSelectEmptySlot={(turfId, date, startHour) => {
                router.push(
                  `/booking/create?turfId=${turfId}&date=${date}&startHour=${startHour}` as any
                );
              }}
              onSelectBooking={(bookingId) => {
                router.push(`/booking/${bookingId}` as any);
              }}
            />
          )}
        </ScrollView>
      ) : (
        /* LIST VIEW */
        <View className="flex-1">
          {/* Search Input */}
          <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 mb-3">
            <Text className="text-zinc-500 mr-2 text-sm">🔍</Text>
            <TextInput
              placeholder="Search by customer, phone, or ground..."
              placeholderTextColor="#71717a"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-white text-xs"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Text className="text-zinc-500 text-xs font-bold px-1">✕</Text>
              </Pressable>
            )}
          </View>

          {/* Filter Status Tabs */}
          <View className="flex-row gap-2 mb-3.5">
            {STATUS_TABS.map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full border ${
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

          {/* List of Booking Cards */}
          {isLoading ? (
            <View className="space-y-3">
              <Skeleton height={140} borderRadius={16} />
              <Skeleton height={140} borderRadius={16} />
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
                    {searchQuery
                      ? "No bookings match your search query."
                      : `No reservations under "${activeTab}".`}
                  </Text>
                </Card>
              }
            />
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}
