import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Input } from "@/components/ui";
import { useTurfs } from "@/hooks/queries/useTurfs";
import { useCreateTournament } from "@/hooks/queries/useTournaments";
import { formatTaka } from "@/lib/currency";
import type {
  TournamentFormat,
  TournamentStatus,
  CreateTournamentPayload,
} from "@/api/types/tournament.types";

const FORMAT_OPTIONS: { label: string; value: TournamentFormat; icon: string }[] = [
  { label: "Knockout", value: "knockout", icon: "⚔️" },
  { label: "League", value: "league", icon: "🏆" },
  { label: "Group Stage", value: "group_stage", icon: "⚡" },
];

const MAX_TEAM_OPTIONS = [4, 8, 16, 32];

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { data: turfs = [], isLoading: loadingTurfs } = useTurfs();
  const createMutation = useCreateTournament();

  const [name, setName] = useState("");
  const [turfId, setTurfId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxTeams, setMaxTeams] = useState(8);
  const [entryFee, setEntryFee] = useState("5000");
  const [prizePool, setPrizePool] = useState("20000");
  const [format, setFormat] = useState<TournamentFormat>("knockout");
  const [status, setStatus] = useState<TournamentStatus>("registration_open");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg("Tournament name is required.");
      return;
    }
    if (!turfId) {
      setErrorMsg("Please select a hosting turf venue.");
      return;
    }

    const selectedTurf = turfs.find((t) => String(t.id) === String(turfId));

    const payload: CreateTournamentPayload = {
      name: name.trim(),
      turfId: String(turfId),
      turfName: selectedTurf?.name || "Main Arena",
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
      maxTeams: Number(maxTeams) || 8,
      entryFee: Number(entryFee) || 0,
      prizePool: Number(prizePool) || 0,
      format,
      status,
      description: description.trim() || undefined,
      rules: rules.trim() || undefined,
      teams: [],
    };

    createMutation.mutate(payload, {
      onSuccess: (newTournament) => {
        if (newTournament?.id) {
          router.replace(`/tournament/${newTournament.id}`);
        } else {
          router.back();
        }
      },
      onError: (err: any) => {
        setErrorMsg(err.message || "Failed to create tournament. Please check details.");
      },
    });
  };

  return (
    <ScreenWrapper className="pb-8">
      <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
        {/* Header */}
        <View className="flex-row items-center justify-between my-2">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center shadow-sm shadow-slate-200/50 dark:shadow-none active:scale-95"
          >
            <Text className="text-slate-800 dark:text-white text-base font-bold">←</Text>
          </Pressable>

          <Text className="text-slate-900 dark:text-white text-lg font-black tracking-tight">Create Tournament</Text>
          <View className="w-10" />
        </View>

        {errorMsg ? (
          <View className="bg-rose-50 dark:bg-red-950/80 border border-rose-200 dark:border-red-800 p-3 rounded-2xl">
            <Text className="text-rose-600 dark:text-red-300 text-xs font-semibold">{errorMsg}</Text>
          </View>
        ) : null}

        {/* Basic Info */}
        <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
          <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Tournament Details
          </Text>

          <Input
            label="Tournament Title *"
            placeholder="e.g. Winter Premier League 2026"
            value={name}
            onChangeText={setName}
          />

          {/* Turf Venue Selector */}
          <View>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-semibold mb-2">
              Select Venue / Turf *
            </Text>
            {loadingTurfs ? (
              <Text className="text-slate-400 dark:text-zinc-500 text-xs">Loading venues...</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                {turfs.map((t) => {
                  const isSelected = String(t.id) === String(turfId);
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setTurfId(String(t.id))}
                      className={`px-3.5 py-2.5 rounded-xl border mr-2 ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 shadow-sm shadow-emerald-500/10"
                          : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-zinc-300"
                        }`}
                      >
                        🏟️ {t.name}
                      </Text>
                      <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">
                        {t.type || "Turf Ground"}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Format Selector */}
          <View>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-semibold mb-2">
              Tournament Format
            </Text>
            <View className="flex-row gap-2">
              {FORMAT_OPTIONS.map((opt) => {
                const isSelected = format === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setFormat(opt.value)}
                    className={`flex-1 p-2.5 rounded-xl border items-center ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 shadow-sm shadow-emerald-500/10"
                        : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                    }`}
                  >
                    <Text className="text-base mb-1">{opt.icon}</Text>
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Max Teams Stepper */}
          <View>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-semibold mb-2">
              Maximum Teams Capacity
            </Text>
            <View className="flex-row gap-2">
              {MAX_TEAM_OPTIONS.map((count) => {
                const isSelected = maxTeams === count;
                return (
                  <Pressable
                    key={count}
                    onPress={() => setMaxTeams(count)}
                    className={`flex-1 py-2 rounded-xl border items-center ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                        : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-white" : "text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {count} Teams
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Financials & Dates */}
        <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
          <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Pricing & Schedule
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Entry Fee (৳)"
                placeholder="5000"
                keyboardType="numeric"
                value={entryFee}
                onChangeText={setEntryFee}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Prize Pool (৳)"
                placeholder="20000"
                keyboardType="numeric"
                value={prizePool}
                onChangeText={setPrizePool}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Start Date"
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View className="flex-1">
              <Input
                label="End Date"
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>
        </Card>

        {/* Guidelines & Rules */}
        <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
          <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Rules & Description
          </Text>

          <View>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-semibold mb-1">
              Tournament Description
            </Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Describe championship background, sponsors, or requirements..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 text-slate-900 dark:text-white text-xs leading-relaxed"
            />
          </View>

          <View>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-semibold mb-1">
              Official Match Rules
            </Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="e.g. 7-a-side, 20-min halves, rubber studs only..."
              placeholderTextColor="#94a3b8"
              value={rules}
              onChangeText={setRules}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 text-slate-900 dark:text-white text-xs leading-relaxed"
            />
          </View>
        </Card>

        {/* Submit Actions */}
        <View className="flex-row gap-3 pt-2">
          <Button
            title="Cancel"
            variant="outline"
            className="flex-1"
            onPress={() => router.back()}
          />
          <Button
            title="Launch Tournament"
            variant="primary"
            className="flex-1"
            loading={createMutation.isPending}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
