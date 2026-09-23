import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, Linking, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Skeleton } from "@/components/ui";
import { useCustomers, CustomerProfile } from "@/hooks/queries/useCustomers";
import { formatTaka } from "@/lib/currency";

const TIER_FILTERS: Array<"all" | "VIP" | "Regular" | "New"> = ["all", "VIP", "Regular", "New"];

export default function CustomersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<"all" | "VIP" | "Regular" | "New">("all");

  const { data: customers = [], isLoading, isRefetching, refetch } = useCustomers();

  // Aggregate stats
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalBookings = customers.reduce((sum, c) => sum + c.bookingsCount, 0);
  const avgBookings = totalCustomers ? (totalBookings / totalCustomers).toFixed(1) : "0";

  // Filtered list
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    const matchesTier = selectedTier === "all" || c.tier === selectedTier;

    return matchesSearch && matchesTier;
  });

  const handleCall = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          if (Platform.OS === "web") {
            window.alert(`Call ${phone}`);
          } else {
            Alert.alert("Call Player", `Dial: ${phone}`);
          }
        }
      })
      .catch(() => {
        Alert.alert("Error", `Cannot open phone dialer for ${phone}`);
      });
  };

  const getTierVariant = (tier: "VIP" | "Regular" | "New") => {
    switch (tier) {
      case "VIP":
        return "warning";
      case "Regular":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <ScreenWrapper className="pb-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center shadow-sm shadow-slate-200/50 dark:shadow-none active:scale-95"
          >
            <Text className="text-slate-800 dark:text-white text-base font-bold">←</Text>
          </Pressable>
          <View>
            <Text className="text-slate-900 dark:text-white text-xl font-black tracking-tight">Customer CRM</Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs">
              {totalCustomers} players registered across bookings
            </Text>
          </View>
        </View>
      </View>

      {/* Overview Stat Cards */}
      <View className="flex-row gap-2.5 mb-3.5">
        <Card className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
            Total Players
          </Text>
          <Text className="text-slate-900 dark:text-white font-black text-lg mt-1">{totalCustomers}</Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">Database</Text>
        </Card>

        <Card className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
            Avg. Matches
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 font-black text-lg mt-1">{avgBookings}</Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">per player</Text>
        </Card>

        <Card className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
            Total Spend
          </Text>
          <Text className="text-emerald-600 dark:text-emerald-400 font-black text-base mt-1" numberOfLines={1}>
            {formatTaka(totalRevenue)}
          </Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">Revenue</Text>
        </Card>
      </View>

      {/* Search Input */}
      <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 mb-3 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <Text className="text-slate-400 dark:text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search by player name or phone..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-slate-900 dark:text-white text-xs"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-slate-400 dark:text-zinc-400 text-xs px-1">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Tier Filter Chips */}
      <View className="flex-row gap-2 mb-3.5">
        {TIER_FILTERS.map((tier) => {
          const isSelected = selectedTier === tier;
          return (
            <Pressable
              key={tier}
              onPress={() => setSelectedTier(tier)}
              className={`px-3.5 py-1.5 rounded-full border ${
                isSelected
                  ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
              }`}
            >
              <Text
                className={`text-xs font-semibold capitalize ${
                  isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                {tier}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Customer Directory List */}
      {isLoading ? (
        <View className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={85} borderRadius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.phone}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card className="bg-white/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-8 items-center justify-center my-6 rounded-2xl">
              <Text className="text-3xl mb-2">👥</Text>
              <Text className="text-slate-800 dark:text-zinc-300 font-bold text-sm">No customers found</Text>
              <Text className="text-slate-500 dark:text-zinc-500 text-xs text-center mt-1">
                {searchQuery
                  ? "Try searching with a different name or phone number"
                  : "Customers will appear here automatically when reservations are made"}
              </Text>
            </Card>
          }
          renderItem={({ item }) => {
            const initial = item.name ? item.name[0].toUpperCase() : "?";
            return (
              <Pressable
                onPress={() => router.push(`/customers/${encodeURIComponent(item.phone)}` as any)}
                className="mb-2.5 active:opacity-90"
              >
                <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
                  <View className="flex-row items-center justify-between">
                    {/* Left: Avatar & Info */}
                    <View className="flex-row items-center gap-3 flex-1 mr-2">
                      <View className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 items-center justify-center shadow-sm">
                        <Text className="text-emerald-600 dark:text-emerald-400 font-black text-base">{initial}</Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-slate-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Badge
                            label={item.tier}
                            variant={getTierVariant(item.tier)}
                            size="sm"
                          />
                        </View>
                        <Text className="text-slate-500 dark:text-zinc-400 text-xs font-mono mt-0.5">
                          {item.phone}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Call & Open Action */}
                    <View className="flex-row items-center gap-1.5">
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCall(item.phone);
                        }}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 items-center justify-center active:bg-slate-200 dark:active:bg-zinc-700"
                      >
                        <Text className="text-sm">📞</Text>
                      </Pressable>
                      <View className="w-6 items-center">
                        <Text className="text-slate-400 dark:text-zinc-500 text-base font-bold">›</Text>
                      </View>
                    </View>
                  </View>

                  {/* Metrics Footer */}
                  <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-2.5 mt-3">
                    <View className="flex-row items-center gap-3">
                      <View>
                        <Text className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-semibold">
                          Matches
                        </Text>
                        <Text className="text-slate-800 dark:text-zinc-200 text-xs font-bold">
                          {item.bookingsCount} played
                        </Text>
                      </View>
                      <View>
                        <Text className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-semibold">
                          Total Spent
                        </Text>
                        <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-black">
                          {formatTaka(item.totalSpent)}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      {item.unpaidDues > 0 ? (
                        <View className="flex-row items-center gap-1">
                          <Text className="text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                            Due: {formatTaka(item.unpaidDues)}
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-slate-400 dark:text-zinc-500 text-[10px]">
                          Last: {item.lastBookingDate || "—"}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </ScreenWrapper>
  );
}
