import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Card, Badge } from "@/components/ui";
import { AmenityList } from "./AmenityList";
import { formatTaka } from "@/lib/currency";
import type { Turf } from "@/api/types/turf.types";

export interface TurfCardProps {
  turf: Turf;
  onPress: (id: string | number) => void;
}

export const TurfCard: React.FC<TurfCardProps> = ({ turf, onPress }) => {
  return (
    <Pressable
      onPress={() => onPress(turf.id)}
      className="mb-4 active:scale-[0.98] transition-transform"
    >
      <Card
        variant="elevated"
        className="overflow-hidden p-0 bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 shadow-sm shadow-slate-300/40 dark:shadow-none"
      >
        {/* Turf Image or Premium Gradient Placeholder */}
        <View className="h-44 w-full bg-slate-100 dark:bg-zinc-800 relative">
          {turf.imageUrl ? (
            <Image
              source={{ uri: turf.imageUrl }}
              className="w-full h-full object-cover"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gradient-to-tr from-emerald-100 to-emerald-200 dark:from-emerald-950/80 dark:to-zinc-900">
              <Text className="text-zinc-600 font-bold text-4xl">⚽</Text>
            </View>
          )}

          {/* Type Badge */}
          <View className="absolute top-3 left-3">
            <Badge label={turf.type || "Sports Turf"} variant="default" size="sm" />
          </View>

          {/* Status Badge */}
          <View className="absolute top-3 right-3">
            <Badge
              label={turf.status}
              variant={turf.status === "active" ? "paid" : "pending"}
              size="sm"
            />
          </View>
        </View>

        {/* Content Section */}
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-slate-900 dark:text-white font-bold text-lg" numberOfLines={1}>
                {turf.name}
              </Text>
              {turf.location && (
                <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5" numberOfLines={1}>
                  📍 {turf.location}
                </Text>
              )}
            </View>

            {/* Price Per Hour */}
            <View className="items-end">
              <Text className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
                {formatTaka(turf.basePrice)}
              </Text>
              <Text className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-semibold">
                Per Hour
              </Text>
            </View>
          </View>

          {/* Amenities */}
          {turf.amenities && turf.amenities.length > 0 && (
            <AmenityList amenities={turf.amenities} maxDisplay={3} />
          )}

          {/* Hours info */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <Text className="text-slate-500 dark:text-zinc-400 text-xs">
              ⏰ {turf.openingHour}:00 - {turf.closingHour}:00
            </Text>
            <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              Book Slot →
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
};
