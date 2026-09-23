import React from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Skeleton } from "@/components/ui";
import { AmenityList } from "@/components/turf/AmenityList";
import { useTurf } from "@/hooks/queries/useTurfs";
import { useAuthStore, selectUser } from "@/stores/auth.store";
import { formatTaka } from "@/lib/currency";

export default function TurfDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const isAdmin = user?.role === "admin";

  const { data: turf, isLoading, error } = useTurf(id!);

  if (isLoading) {
    return (
      <ScreenWrapper className="p-4">
        <Skeleton height={240} borderRadius={16} className="mb-4" />
        <Skeleton height={32} width="70%" className="mb-2" />
        <Skeleton height={20} width="40%" className="mb-4" />
        <Skeleton height={120} borderRadius={16} />
      </ScreenWrapper>
    );
  }

  if (error || !turf) {
    return (
      <ScreenWrapper className="items-center justify-center p-6">
        <Text className="text-4xl mb-3">⚠️</Text>
        <Text className="text-white text-lg font-bold">Turf Not Found</Text>
        <Text className="text-zinc-400 text-xs mt-1 text-center mb-4">
          Could not load details for this ground.
        </Text>
        <Button title="Back to Explore" onPress={() => router.back()} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable className="pb-8">
      {/* Top Bar with Back Button */}
      <View className="flex-row items-center justify-between my-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
        >
          <Text className="text-white text-base font-bold">←</Text>
        </Pressable>
        <Text className="text-white font-bold text-base">Ground Details</Text>
        {isAdmin ? (
          <Pressable
            onPress={() => router.push(`/turf/manage?id=${turf.id}` as any)}
            className="px-3 py-1.5 rounded-full bg-zinc-900 border border-emerald-500/40 items-center justify-center"
          >
            <Text className="text-emerald-400 font-semibold text-xs">Edit ⚙️</Text>
          </Pressable>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {/* Hero Image */}
      <View className="h-56 w-full rounded-2xl overflow-hidden bg-zinc-900 mb-4 relative">
        {turf.imageUrl ? (
          <Image
            source={{ uri: turf.imageUrl }}
            className="w-full h-full object-cover"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-zinc-900">
            <Text className="text-5xl">⚽</Text>
          </View>
        )}
        <View className="absolute top-3 left-3">
          <Badge label={turf.type || "Sports Ground"} variant="default" />
        </View>
        <View className="absolute top-3 right-3">
          <Badge
            label={turf.status}
            variant={turf.status === "active" ? "paid" : "pending"}
          />
        </View>
      </View>

      {/* Title & Location */}
      <View className="mb-4">
        <Text className="text-white text-2xl font-black">{turf.name}</Text>
        {turf.location && (
          <Text className="text-zinc-400 text-sm mt-1">📍 {turf.location}</Text>
        )}
        {turf.size && (
          <Text className="text-zinc-500 text-xs mt-0.5">📐 Size: {turf.size}</Text>
        )}
      </View>

      {/* Pricing & Hours Card */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-3">
          Rates & Schedule
        </Text>

        <View className="flex-row justify-between py-2 border-b border-zinc-800">
          <Text className="text-zinc-300 text-sm">Regular Hourly Rate</Text>
          <Text className="text-emerald-400 font-extrabold text-base">
            {formatTaka(turf.basePrice)} / hr
          </Text>
        </View>

        {turf.peakPrice ? (
          <View className="flex-row justify-between py-2 border-b border-zinc-800">
            <Text className="text-zinc-300 text-sm">Peak Hours Rate</Text>
            <Text className="text-amber-400 font-bold text-sm">
              {formatTaka(turf.peakPrice)} / hr
            </Text>
          </View>
        ) : null}

        <View className="flex-row justify-between py-2">
          <Text className="text-zinc-300 text-sm">Operating Hours</Text>
          <Text className="text-white font-medium text-sm">
            {turf.openingHour}:00 - {turf.closingHour}:00
          </Text>
        </View>
      </Card>

      {/* Amenities Section */}
      {turf.amenities && turf.amenities.length > 0 && (
        <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
          <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2">
            Available Amenities
          </Text>
          <AmenityList amenities={turf.amenities} maxDisplay={10} />
        </Card>
      )}

      {/* Description */}
      {turf.description && (
        <Card className="mb-6 bg-zinc-900 border-zinc-800 p-4">
          <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2">
            About Ground
          </Text>
          <Text className="text-zinc-300 text-sm leading-relaxed">
            {turf.description}
          </Text>
        </Card>
      )}

      {/* Book Now Action Button */}
      <Button
        title={`Book Now (${formatTaka(turf.basePrice)} / hr)`}
        variant="primary"
        size="lg"
        onPress={() =>
          router.push({
            pathname: "/booking/create",
            params: { turfId: String(turf.id), turfName: turf.name },
          } as any)
        }
      />
    </ScreenWrapper>
  );
}
