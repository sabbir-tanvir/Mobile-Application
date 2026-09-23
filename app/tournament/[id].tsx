import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Skeleton } from "@/components/ui";
import {
  useTournament,
  useUpdateTournament,
  useDeleteTournament,
} from "@/hooks/queries/useTournaments";
import { useAuthStore } from "@/stores/auth.store";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { TeamManager } from "@/components/tournament/TeamManagerModal";
import { BracketVisualizer } from "@/components/tournament/BracketVisualizer";
import type { TournamentStatus, TournamentTeam } from "@/api/types/tournament.types";

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

const ALL_STATUSES: TournamentStatus[] = [
  "upcoming",
  "registration_open",
  "in_progress",
  "completed",
  "cancelled",
];

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState<"teams" | "brackets" | "info">("teams");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const { data: tournament, isLoading, error } = useTournament(id || "");
  const updateMutation = useUpdateTournament();
  const deleteMutation = useDeleteTournament();

  if (isLoading) {
    return (
      <ScreenWrapper className="p-4 space-y-4">
        <Skeleton height={40} borderRadius={8} className="w-1/3 mb-2" />
        <Skeleton height={140} borderRadius={16} />
        <Skeleton height={80} borderRadius={16} />
        <Skeleton height={300} borderRadius={16} />
      </ScreenWrapper>
    );
  }

  if (error || !tournament) {
    return (
      <ScreenWrapper className="p-4 items-center justify-center">
        <Text className="text-red-400 font-bold text-base mb-2">Tournament Not Found</Text>
        <Text className="text-zinc-400 text-xs text-center mb-4">
          The tournament may have been deleted or the link is expired.
        </Text>
        <Button title="Back to Tournaments" variant="primary" onPress={() => router.back()} />
      </ScreenWrapper>
    );
  }

  const teams: TournamentTeam[] = Array.isArray(tournament.teams) ? tournament.teams : [];
  const totalCollected = teams.reduce((acc, team) => {
    return acc + (team.paid ? tournament.entryFee : 0);
  }, 0);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🏆 Join the "${tournament.name}" championship at ${tournament.turfName || "Turf Arena"}! Entry: ${formatTaka(tournament.entryFee)}, Prize Pool: ${formatTaka(tournament.prizePool)}!`,
      });
    } catch {
      // ignore
    }
  };

  const handleStatusChange = (newStatus: TournamentStatus) => {
    setShowStatusMenu(false);
    updateMutation.mutate({
      id: tournament.id,
      payload: { status: newStatus },
    });
  };

  const handleDelete = () => {
    const executeDelete = () => {
      deleteMutation.mutate(tournament.id, {
        onSuccess: () => {
          router.replace("/(tabs)/tournaments");
        },
      });
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Permanently delete "${tournament.name}"?`)) {
        executeDelete();
      }
    } else {
      Alert.alert(
        "Delete Tournament",
        `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: executeDelete },
        ]
      );
    }
  };

  const currentBadge = STATUS_BADGE_MAP[tournament.status] || {
    label: tournament.status.toUpperCase(),
    variant: "default",
  };

  return (
    <ScreenWrapper className="pb-6">
      <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
        {/* Top Header */}
        <View className="flex-row items-center justify-between my-2">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
          >
            <Text className="text-white text-base font-bold">←</Text>
          </Pressable>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleShare}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 flex-row items-center"
            >
              <Text className="text-zinc-300 text-xs font-semibold">🔗 Share</Text>
            </Pressable>

            {isAdmin ? (
              <Pressable
                onPress={handleDelete}
                className="w-10 h-10 rounded-full bg-red-950/50 border border-red-900/60 items-center justify-center"
              >
                <Text className="text-red-400 text-sm">🗑️</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Hero Card */}
        <Card className="bg-gradient-to-b from-zinc-850 to-zinc-900 border-zinc-800 p-4 rounded-2xl">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-2">
              <Text className="text-white text-2xl font-black">{tournament.name}</Text>
              <Text className="text-emerald-400 text-xs font-semibold mt-0.5">
                🏟️ {tournament.turfName || "Turf Arena"} • {tournament.format?.replace("_", " ").toUpperCase()}
              </Text>
            </View>

            <Pressable
              onPress={() => isAdmin && setShowStatusMenu(!showStatusMenu)}
              disabled={!isAdmin}
            >
              <Badge
                label={currentBadge.label}
                variant={currentBadge.variant}
                size="sm"
              />
            </Pressable>
          </View>

          {/* Admin Status Dropdown */}
          {showStatusMenu && isAdmin ? (
            <View className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 my-2 space-y-1">
              <Text className="text-zinc-500 text-[10px] uppercase font-bold px-2 py-1">
                Change Status
              </Text>
              {ALL_STATUSES.map((st) => (
                <Pressable
                  key={st}
                  onPress={() => handleStatusChange(st)}
                  className={`px-3 py-2 rounded-lg ${
                    tournament.status === st ? "bg-emerald-950 border border-emerald-800" : ""
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      tournament.status === st ? "text-emerald-400" : "text-zinc-300"
                    }`}
                  >
                    {STATUS_BADGE_MAP[st]?.label || st}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {/* Dates Bar */}
          <View className="flex-row items-center gap-2 mt-2 pt-2 border-t border-zinc-800/60">
            <Text className="text-zinc-400 text-xs">
              📅 {tournament.startDate ? formatDate(tournament.startDate) : "TBD"} -{" "}
              {tournament.endDate ? formatDate(tournament.endDate) : "TBD"}
            </Text>
          </View>
        </Card>

        {/* 4 Stat Counters */}
        <View className="grid grid-cols-2 gap-2.5">
          <Card className="bg-zinc-900 border-zinc-800 p-3">
            <Text className="text-zinc-500 text-[10px] uppercase font-bold">
              Registered Teams
            </Text>
            <Text className="text-white text-lg font-black mt-0.5">
              {teams.length}{" "}
              <Text className="text-zinc-500 text-xs font-normal">
                / {tournament.maxTeams}
              </Text>
            </Text>
            <View className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <View
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (teams.length / (tournament.maxTeams || 1)) * 100
                  )}%`,
                }}
              />
            </View>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-3">
            <Text className="text-zinc-500 text-[10px] uppercase font-bold">
              Prize Pool
            </Text>
            <Text className="text-amber-400 text-lg font-black mt-0.5">
              🏆 {formatTaka(tournament.prizePool)}
            </Text>
            <Text className="text-zinc-500 text-[10px] mt-2">
              Entry: {formatTaka(tournament.entryFee)}/team
            </Text>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-3">
            <Text className="text-zinc-500 text-[10px] uppercase font-bold">
              Fees Collected
            </Text>
            <Text className="text-emerald-400 text-lg font-black mt-0.5">
              ৳{totalCollected.toLocaleString()}
            </Text>
            <Text className="text-zinc-500 text-[10px] mt-2">
              {teams.filter((t) => t.paid).length} of {teams.length} paid
            </Text>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-3">
            <Text className="text-zinc-500 text-[10px] uppercase font-bold">
              Format
            </Text>
            <Text className="text-white text-base font-bold mt-0.5 capitalize">
              {tournament.format?.replace("_", " ")}
            </Text>
            <Text className="text-zinc-500 text-[10px] mt-2">
              Max {tournament.maxTeams} teams
            </Text>
          </Card>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 mt-2">
          <Pressable
            onPress={() => setActiveTab("teams")}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              activeTab === "teams" ? "bg-emerald-600" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "teams" ? "text-white" : "text-zinc-400"
              }`}
            >
              🛡️ Teams ({teams.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("brackets")}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              activeTab === "brackets" ? "bg-emerald-600" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "brackets" ? "text-white" : "text-zinc-400"
              }`}
            >
              ⚔️ Brackets
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("info")}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              activeTab === "info" ? "bg-emerald-600" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "info" ? "text-white" : "text-zinc-400"
              }`}
            >
              📜 Rules & Info
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        {activeTab === "teams" && <TeamManager tournament={tournament} />}

        {activeTab === "brackets" && (
          <BracketVisualizer
            teams={teams}
            maxTeams={tournament.maxTeams}
            format={tournament.format}
          />
        )}

        {activeTab === "info" && (
          <View className="space-y-3">
            {tournament.description ? (
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <Text className="text-white font-bold text-sm mb-1">About Tournament</Text>
                <Text className="text-zinc-400 text-xs leading-relaxed">
                  {tournament.description}
                </Text>
              </Card>
            ) : null}

            {tournament.rules ? (
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <Text className="text-white font-bold text-sm mb-1">Tournament Rules</Text>
                <Text className="text-zinc-400 text-xs leading-relaxed">
                  {tournament.rules}
                </Text>
              </Card>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800 p-4">
                <Text className="text-white font-bold text-sm mb-1">Standard Regulations</Text>
                <Text className="text-zinc-400 text-xs leading-relaxed">
                  • 20-minute halves with a 5-minute break.{"\n"}
                  • Maximum of 7 active players and 3 substitutes per match.{"\n"}
                  • Studs must be rubber-turf compliant. Metal spikes strictly prohibited.{"\n"}
                  • Disciplinary cards carry over throughout knockout stages.
                </Text>
              </Card>
            )}

            {/* Quick Venue Info */}
            <Card className="bg-zinc-900 border-zinc-800 p-4 flex-row items-center justify-between">
              <View>
                <Text className="text-white font-bold text-sm">Venue Location</Text>
                <Text className="text-zinc-400 text-xs mt-0.5">
                  {tournament.turfName || "Main Arena Pitch"}
                </Text>
              </View>
              <Badge label="VERIFIED GROUND" variant="success" size="sm" />
            </Card>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
