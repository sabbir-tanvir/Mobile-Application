import React from "react";
import { View, Text, FlatList } from "react-native";
import { ScreenWrapper, Card, Badge, Skeleton } from "@/components/ui";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { useTournaments } from "@/hooks/queries/useTournaments";
import type { Tournament } from "@/api/types/tournament.types";

export default function TournamentsScreen() {
  const { data: tournaments, isLoading, refetch, isRefetching } = useTournaments();

  const renderTournamentItem = ({ item }: { item: Tournament }) => (
    <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
      {/* Header: Title + Status */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white font-bold text-lg flex-1 mr-2" numberOfLines={1}>
          {item.name}
        </Text>
        <Badge
          label={item.status || "upcoming"}
          variant={
            item.status === "ongoing"
              ? "success"
              : item.status === "completed"
              ? "default"
              : "warning"
          }
          size="sm"
        />
      </View>

      {/* Turf & Dates */}
      <Text className="text-zinc-400 text-xs mb-3">
        🏟️ {item.turfName || "Turf Arena"} • 📅 {formatDate(item.startDate)} to{" "}
        {formatDate(item.endDate)}
      </Text>

      {/* Entry Fee & Prize Pool */}
      <View className="bg-zinc-950/70 border border-zinc-800/60 rounded-xl p-3 flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-zinc-500 text-[10px] uppercase font-semibold">
            Entry Fee
          </Text>
          <Text className="text-white font-bold text-sm">
            {formatTaka(item.entryFee)}
          </Text>
        </View>

        {item.prizePool ? (
          <View className="items-end">
            <Text className="text-zinc-500 text-[10px] uppercase font-semibold">
              Prize Pool
            </Text>
            <Text className="text-emerald-400 font-extrabold text-sm">
              🏆 {formatTaka(item.prizePool)}
            </Text>
          </View>
        ) : null}

        {item.maxTeams ? (
          <View className="items-end">
            <Text className="text-zinc-500 text-[10px] uppercase font-semibold">
              Teams
            </Text>
            <Text className="text-zinc-300 font-bold text-sm">
              👥 Max {item.maxTeams}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Description */}
      {item.description ? (
        <Text className="text-zinc-400 text-xs leading-relaxed" numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </Card>
  );

  return (
    <ScreenWrapper className="pb-4">
      <View className="my-3">
        <Text className="text-white text-2xl font-black">Tournaments</Text>
        <Text className="text-zinc-400 text-xs mt-0.5">
          Compete in community leagues & championships
        </Text>
      </View>

      {isLoading ? (
        <View className="space-y-3">
          <Skeleton height={160} borderRadius={16} className="mb-3" />
          <Skeleton height={160} borderRadius={16} />
        </View>
      ) : (
        <FlatList
          data={tournaments || []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTournamentItem}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <Card className="items-center justify-center py-12 bg-zinc-900/60">
              <Text className="text-4xl mb-3">🏆</Text>
              <Text className="text-white font-bold text-base">
                No active tournaments
              </Text>
              <Text className="text-zinc-500 text-xs mt-1 text-center px-4">
                Stay tuned! New competitive events and tournaments will appear here.
              </Text>
            </Card>
          }
        />
      )}
    </ScreenWrapper>
  );
}
