import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Skeleton, Card } from "@/components/ui";
import { TurfCard } from "@/components/turf/TurfCard";
import { useTurfs } from "@/hooks/queries/useTurfs";
import { useAuthStore, selectUser } from "@/stores/auth.store";

const CATEGORIES = ["All", "Football", "Cricket", "Badminton", "Futsal"];

export default function ExploreScreen() {
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const isAdmin = user?.role === "admin";
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: turfs, isLoading, refetch, isRefetching } = useTurfs();

  const filteredTurfs = (turfs || []).filter((turf) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (turf.type &&
        turf.type.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesSearch =
      !searchQuery ||
      turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (turf.location &&
        turf.location.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <ScreenWrapper className="pb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between my-3">
        <View>
          <Text className="text-slate-900 dark:text-white text-2xl font-black">Explore Turfs</Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">
            Find and reserve sports grounds
          </Text>
        </View>
        {isAdmin && (
          <Pressable
            onPress={() => router.push("/turf/manage" as any)}
            className="flex-row items-center px-3.5 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 border border-emerald-500 shadow-sm shadow-emerald-900/30"
          >
            <Text className="text-white font-bold text-xs">+ Add Pitch</Text>
          </Pressable>
        )}
      </View>

      {/* Search Input Bar */}
      <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 mb-3.5 shadow-sm shadow-slate-200/50 dark:shadow-none">
        <Text className="text-slate-400 dark:text-zinc-500 mr-2 text-base">🔍</Text>
        <TextInput
          placeholder="Search by turf name or location..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-slate-900 dark:text-white text-sm"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-slate-400 dark:text-zinc-500 text-xs font-bold px-1">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Sport Category Filter Chips */}
      <View className="flex-row gap-2 mb-4">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full border ${
                isSelected
                  ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm shadow-slate-200/40 dark:shadow-none"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Turfs List */}
      {isLoading ? (
        <View className="space-y-4">
          <Skeleton height={200} borderRadius={16} className="mb-3" />
          <Skeleton height={200} borderRadius={16} className="mb-3" />
          <Skeleton height={200} borderRadius={16} />
        </View>
      ) : (
        <FlatList
          data={filteredTurfs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TurfCard
              turf={item}
              onPress={(id) => router.push(`/turf/${id}` as any)}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <Card
              variant="surface"
              className="items-center justify-center py-12 bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800"
            >
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-slate-900 dark:text-white font-bold text-base">
                No turfs match your criteria
              </Text>
              <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-1 text-center px-4">
                Try searching with different keywords or choosing "All"
              </Text>
            </Card>
          }
        />
      )}
    </ScreenWrapper>
  );
}
