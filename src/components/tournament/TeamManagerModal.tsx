import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { Card, Badge, Button, Input } from "@/components/ui";
import { useUpdateTournament } from "@/hooks/queries/useTournaments";
import { formatTaka } from "@/lib/currency";
import type { Tournament, TournamentTeam } from "@/api/types/tournament.types";

interface TeamManagerProps {
  tournament: Tournament;
}

export function TeamManager({ tournament }: TeamManagerProps) {
  const updateMutation = useUpdateTournament();

  const [showAddModal, setShowAddModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const teams: TournamentTeam[] = Array.isArray(tournament.teams) ? tournament.teams : [];
  const isFull = teams.length >= (tournament.maxTeams || 8);

  const resetForm = () => {
    setTeamName("");
    setCaptainName("");
    setCaptainPhone("");
    setIsPaid(false);
    setErrorMsg("");
  };

  const handleAddTeam = () => {
    if (!teamName.trim()) {
      setErrorMsg("Team name is required");
      return;
    }
    if (!captainName.trim()) {
      setErrorMsg("Captain name is required");
      return;
    }
    if (isFull) {
      setErrorMsg(`Tournament has reached maximum capacity (${tournament.maxTeams} teams).`);
      return;
    }

    const newTeam: TournamentTeam = {
      name: teamName.trim(),
      captainName: captainName.trim(),
      captainPhone: captainPhone.trim(),
      paid: isPaid,
    };

    const updatedTeams = [...teams, newTeam];

    updateMutation.mutate(
      {
        id: tournament.id,
        payload: {
          teams: updatedTeams,
        },
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          resetForm();
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Failed to register team. Please try again.");
        },
      }
    );
  };

  const handleTogglePaid = (index: number) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = {
      ...updatedTeams[index],
      paid: !updatedTeams[index].paid,
    };

    updateMutation.mutate({
      id: tournament.id,
      payload: {
        teams: updatedTeams,
      },
    });
  };

  const handleRemoveTeam = (index: number) => {
    const teamToRemove = teams[index];
    const confirmRemove = () => {
      const updatedTeams = teams.filter((_, i) => i !== index);
      updateMutation.mutate({
        id: tournament.id,
        payload: {
          teams: updatedTeams,
        },
      });
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Remove "${teamToRemove.name}" from this tournament?`)) {
        confirmRemove();
      }
    } else {
      Alert.alert(
        "Remove Team",
        `Are you sure you want to remove "${teamToRemove.name}" from this tournament?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: confirmRemove },
        ]
      );
    }
  };

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View className="space-y-4">
      {/* Header & Add Team Action */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-slate-900 dark:text-white font-bold text-base">Registered Teams</Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs">
            {teams.length} of {tournament.maxTeams} spots filled
          </Text>
        </View>

        <Button
          title={isFull ? "Roster Full" : "+ Register Team"}
          variant={isFull ? "secondary" : "primary"}
          size="sm"
          disabled={isFull}
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
        />
      </View>

      {/* Teams List */}
      {teams.length === 0 ? (
        <Card className="p-8 bg-white/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center border-dashed rounded-2xl">
          <Text className="text-4xl mb-2">🛡️</Text>
          <Text className="text-slate-800 dark:text-white font-bold text-sm">No Teams Registered Yet</Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs text-center mt-1">
            Tap "+ Register Team" to add participating squads and manage captain fees.
          </Text>
        </Card>
      ) : (
        <View className="space-y-2.5">
          {teams.map((team, idx) => (
            <Card
              key={idx}
              className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none flex-row items-center justify-between"
            >
              {/* Team Info */}
              <View className="flex-1 mr-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-slate-400 dark:text-zinc-500 font-black text-xs">#{idx + 1}</Text>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm flex-1" numberOfLines={1}>
                    {team.name}
                  </Text>
                  <Badge
                    label={team.paid ? "PAID" : "UNPAID"}
                    variant={team.paid ? "success" : "warning"}
                    size="sm"
                  />
                </View>

                <View className="flex-row items-center gap-3">
                  <Text className="text-slate-500 dark:text-zinc-400 text-xs flex-1" numberOfLines={1}>
                    Captain: <Text className="text-slate-800 dark:text-zinc-200 font-medium">{team.captainName}</Text>
                  </Text>
                  {team.captainPhone ? (
                    <Pressable
                      onPress={() => handleCall(team.captainPhone)}
                      className="flex-row items-center"
                    >
                      <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        📞 {team.captainPhone}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => handleTogglePaid(idx)}
                  className={`px-3 py-1.5 rounded-xl border ${
                    team.paid
                      ? "bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                      : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-600/60 shadow-sm shadow-emerald-500/10"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      team.paid ? "text-slate-500 dark:text-zinc-400" : "text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {team.paid ? "Mark Unpaid" : "Mark Paid"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleRemoveTeam(idx)}
                  className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-900/50 items-center justify-center active:bg-rose-100"
                >
                  <Text className="text-rose-600 dark:text-red-400 text-xs font-bold">✕</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Add Team Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/60 dark:bg-black/80 justify-end">
          <View className="bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-slate-200 dark:border-zinc-800 p-5 max-h-[85%] shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-slate-900 dark:text-white text-lg font-black">Register Team</Text>
                <Text className="text-slate-500 dark:text-zinc-400 text-xs">
                  {tournament.name} • Entry Fee: {formatTaka(tournament.entryFee)}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 items-center justify-center"
              >
                <Text className="text-slate-500 dark:text-zinc-400 text-sm font-bold">✕</Text>
              </Pressable>
            </View>

            {errorMsg ? (
              <View className="bg-rose-50 dark:bg-red-950/80 border border-rose-200 dark:border-red-800 p-3 rounded-2xl mb-4">
                <Text className="text-rose-600 dark:text-red-300 text-xs font-semibold">{errorMsg}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              <Input
                label="Team Name *"
                placeholder="e.g. Dhaka Strikers FC"
                value={teamName}
                onChangeText={setTeamName}
              />

              <Input
                label="Captain Full Name *"
                placeholder="e.g. Tanvir Ahmed"
                value={captainName}
                onChangeText={setCaptainName}
              />

              <Input
                label="Captain Phone Number"
                placeholder="e.g. 01711223344"
                keyboardType="phone-pad"
                value={captainPhone}
                onChangeText={setCaptainPhone}
              />

              {/* Payment status toggle */}
              <View className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-slate-900 dark:text-white font-semibold text-sm">
                    Entry Fee Paid ({formatTaka(tournament.entryFee)})
                  </Text>
                  <Text className="text-slate-400 dark:text-zinc-500 text-xs">
                    Mark if the captain has already transferred the registration fee.
                  </Text>
                </View>

                <Pressable
                  onPress={() => setIsPaid(!isPaid)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    isPaid ? "bg-emerald-600 items-end" : "bg-slate-300 dark:bg-zinc-800 items-start"
                  }`}
                >
                  <View className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </Pressable>
              </View>

              <View className="flex-row gap-3 pt-4">
                <Button
                  title="Cancel"
                  variant="outline"
                  className="flex-1"
                  onPress={() => setShowAddModal(false)}
                />
                <Button
                  title="Register Team"
                  variant="primary"
                  className="flex-1"
                  loading={updateMutation.isPending}
                  onPress={handleAddTeam}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
