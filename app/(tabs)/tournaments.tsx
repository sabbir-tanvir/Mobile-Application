import React, { useState } from "react";
import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Skeleton } from "@/components/ui";
import { useTournaments } from "@/hooks/queries/useTournaments";
import { useAuthStore } from "@/stores/auth.store";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { Tournament, TournamentStatus, TournamentTeam } from "@/api/types/tournament.types";

const STATUS_BADGE_MAP: Record<
  TournamentStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  upcoming: { label: "UPCOMING", variant: "info" },
  registration_open: { label: "REGISTRATION OPEN", variant: "success" },
  in_progress: { label: "IN PROGRESS", variant: "warning" },
  completed: { label: "COMPLETED", variant: "default" },
  cancelled: { label: "CANCELLED", variant: "danger" },
};

export default function TournamentsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdminOrStaff = user?.role === "admin" || user?.role === "staff";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");

  const { data: tournaments = [], isLoading, refetch, isRefetching } = useTournaments();

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.turfName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.format?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active"
        ? t.status === "registration_open" || t.status === "in_progress"
        : t.status === selectedStatus);

    const matchesFormat =
      selectedFormat === "all" || t.format?.toLowerCase() === selectedFormat.toLowerCase();

    return matchesSearch && matchesStatus && matchesFormat;
  });

  const renderTournamentItem = ({ item }: { item: Tournament }) => {
    const teams: TournamentTeam[] = Array.isArray(item.teams) ? item.teams : [];
    const registeredCount = teams.length;
    const maxCapacity = item.maxTeams || 8;
    const percentFilled = Math.min(100, Math.round((registeredCount / maxCapacity) * 100));

    const badgeConfig = STATUS_BADGE_MAP[item.status] || {
      label: item.status?.toUpperCase() || "UPCOMING",
      variant: "default",
    };

    return (
      <Pressable onPress={() => router.push(`/tournament/${item.id}`)}>
        <Card
          variant="elevated"
          className="mb-4 bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shadow-slate-300/40 dark:shadow-none"
        >
          {/* Top row: Name + Status badge */}
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-slate-900 dark:text-white font-black text-lg flex-1 mr-2" numberOfLines={1}>
              {item.name}
            </Text>
            <Badge label={badgeConfig.label} variant={badgeConfig.variant} size="sm" />
          </View>

          {/* Turf and Format */}
          <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
            🏟️ {item.turfName || "Turf Arena"} • ⚔️ {item.format?.replace("_", " ").toUpperCase()}
          </Text>

          {/* Date Range */}
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">
              📅 {item.startDate ? formatDate(item.startDate) : "TBD"} to{" "}
              {item.endDate ? formatDate(item.endDate) : "TBD"}
            </Text>
          </View>

          {/* Prize and Entry Fee Box */}
          <View className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-3 flex-row justify-between items-center mb-3">
            <View className="flex-1">
              <Text className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase font-bold" numberOfLines={1}>
                Entry Fee
              </Text>
              <Text className="text-slate-900 dark:text-white font-extrabold text-sm" numberOfLines={1}>
                {formatTaka(item.entryFee)}
              </Text>
            </View>

            <View className="items-center flex-1">
              <Text className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase font-bold" numberOfLines={1}>
                Prize Pool
              </Text>
              <Text className="text-amber-500 dark:text-amber-400 font-extrabold text-sm" numberOfLines={1}>
                🏆 {formatTaka(item.prizePool)}
              </Text>
            </View>

            <View className="items-end flex-1">
              <Text className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase font-bold" numberOfLines={1}>
                Teams
              </Text>
              <Text className="text-slate-800 dark:text-zinc-200 font-bold text-sm" numberOfLines={1}>
                {registeredCount} / {maxCapacity}
              </Text>
            </View>
          </View>

          {/* Registration Capacity Progress Bar */}
          <View className="space-y-1">
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-500 dark:text-zinc-500 text-[10px] font-semibold">
                Roster Spots
              </Text>
              <Text className="text-slate-600 dark:text-zinc-400 text-[10px] font-bold">
                {percentFilled}% Filled
              </Text>
            </View>
            <View className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${
                  percentFilled >= 100 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${percentFilled}%` }}
              />
            </View>
          </View>

          {/* View Details Hint */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/50">
            <Text className="text-slate-500 dark:text-zinc-500 text-xs font-medium">
              Tap to view registered squads & brackets
            </Text>
            <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">→</Text>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper className="pb-4">
      {/* Title & Create Action */}
      <View className="flex-row items-center justify-between my-3">
        <View>
          <Text className="text-slate-900 dark:text-white text-2xl font-black">Tournaments</Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">
            Compete in championship leagues & cups
          </Text>
        </View>

        {isAdminOrStaff ? (
          <Button
            title="+ Create"
            variant="primary"
            size="sm"
            onPress={() => router.push("/tournament/create")}
          />
        ) : null}
      </View>

      {/* Search Input */}
      <View className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 flex-row items-center mb-3 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <Text className="text-slate-400 dark:text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search tournament, venue, or format..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-slate-900 dark:text-white text-xs"
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-slate-400 dark:text-zinc-500 text-xs font-bold">✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Status Filter Chips */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-2 mb-3"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Upcoming", value: "upcoming" },
            { label: "Completed", value: "completed" },
          ].map((f) => {
            const isSelected = selectedStatus === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => setSelectedStatus(f.value)}
                className={`px-3 py-1.5 rounded-full border ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm shadow-slate-200/40 dark:shadow-none"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="space-y-3">
          <Skeleton height={180} borderRadius={16} />
          <Skeleton height={180} borderRadius={16} />
        </View>
      ) : filteredTournaments.length === 0 ? (
        <Card
          variant="surface"
          className="p-8 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 items-center justify-center my-6 border-dashed"
        >
          <Text className="text-4xl mb-2">🏆</Text>
          <Text className="text-slate-900 dark:text-white font-bold text-sm">No Tournaments Found</Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs text-center mt-1 mb-4">
            {searchQuery
              ? "No tournaments match your search criteria."
              : "No tournaments are currently organized."}
          </Text>
          {isAdminOrStaff ? (
            <Button
              title="Host a Tournament"
              variant="primary"
              size="sm"
              onPress={() => router.push("/tournament/create")}
            />
          ) : null}
        </Card>
      ) : (
        <FlatList
          data={filteredTournaments}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTournamentItem}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </ScreenWrapper>
  );
}
