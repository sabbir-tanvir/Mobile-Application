import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Skeleton, Card } from "@/components/ui";
import { TurfCard } from "@/components/turf/TurfCard";
import { useTurfs } from "@/hooks/queries/useTurfs";

const CATEGORIES = ["All", "Football", "Cricket", "Badminton", "Futsal"];

export default function ExploreScreen() {
  const router = useRouter();
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
      <View className="my-3">
        <Text className="text-white text-2xl font-black">Explore Turfs</Text>
        <Text className="text-zinc-400 text-xs mt-0.5">
          Find and reserve sports grounds
        </Text>
      </View>

      {/* Search Input Bar */}
      <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 mb-3.5">
        <Text className="text-zinc-500 mr-2 text-base">🔍</Text>
        <TextInput
          placeholder="Search by turf name or location..."
          placeholderTextColor="#71717a"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-white text-sm"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-zinc-500 text-xs font-bold px-1">✕</Text>
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
                  ? "bg-emerald-600 border-emerald-500"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? "text-white" : "text-zinc-400"
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
            <Card className="items-center justify-center py-12 bg-zinc-900/60">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-white font-bold text-base">
                No turfs match your criteria
              </Text>
              <Text className="text-zinc-500 text-xs mt-1 text-center px-4">
                Try searching with different keywords or choosing "All"
              </Text>
            </Card>
          }
        />
      )}
    </ScreenWrapper>
  );
}
