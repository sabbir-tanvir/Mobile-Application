import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Card, Badge } from "@/components/ui";
import type { TournamentTeam, TournamentFormat } from "@/api/types/tournament.types";

interface BracketVisualizerProps {
  teams: TournamentTeam[];
  maxTeams: number;
  format: TournamentFormat;
}

export function BracketVisualizer({
  teams,
  maxTeams,
  format,
}: BracketVisualizerProps) {
  if (format === "league" || format === "group_stage") {
    return (
      <View className="space-y-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-slate-900 dark:text-white font-bold text-base">
            {format === "league" ? "🏆 League Table & Fixtures" : "⚡ Group Standings"}
          </Text>
          <Badge label={format.replace("_", " ").toUpperCase()} variant="info" size="sm" />
        </View>

        {teams.length === 0 ? (
          <Card className="p-6 bg-white/80 dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-800 items-center rounded-2xl">
            <Text className="text-slate-400 dark:text-zinc-500 text-sm text-center">
              Register teams to generate the round-robin schedule and standings table.
            </Text>
          </Card>
        ) : (
          <View className="space-y-3">
            {/* Standings Table */}
            <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-0 overflow-hidden rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
              <View className="flex-row bg-slate-50 dark:bg-zinc-950 px-3.5 py-2.5 border-b border-slate-200/80 dark:border-zinc-800">
                <Text className="text-slate-400 dark:text-zinc-400 text-xs font-bold w-8">#</Text>
                <Text className="text-slate-400 dark:text-zinc-400 text-xs font-bold flex-1">Team</Text>
                <Text className="text-slate-400 dark:text-zinc-400 text-xs font-bold w-10 text-center">P</Text>
                <Text className="text-slate-400 dark:text-zinc-400 text-xs font-bold w-10 text-center">W</Text>
                <Text className="text-slate-400 dark:text-zinc-400 text-xs font-bold w-12 text-center">PTS</Text>
              </View>

              {teams.map((team, idx) => (
                <View
                  key={idx}
                  className={`flex-row items-center px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800/50 ${
                    idx === 0 ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                  }`}
                >
                  <Text
                    className={`text-xs font-extrabold w-8 ${
                      idx === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-400"
                    }`}
                  >
                    {idx + 1}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-slate-900 dark:text-white font-semibold text-xs" numberOfLines={1}>
                      {team.name}
                    </Text>
                    <Text className="text-slate-400 dark:text-zinc-500 text-[10px]" numberOfLines={1}>
                      C: {team.captainName}
                    </Text>
                  </View>
                  <Text className="text-slate-600 dark:text-zinc-300 text-xs w-10 text-center">0</Text>
                  <Text className="text-slate-600 dark:text-zinc-300 text-xs w-10 text-center">0</Text>
                  <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-xs w-12 text-center">0</Text>
                </View>
              ))}
            </Card>

            {/* Generated Round Fixtures */}
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase mt-2">
              📅 Match Fixtures
            </Text>
            {teams.length >= 2 ? (
              <View className="space-y-2">
                {Array.from({ length: Math.min(teams.length - 1, 3) }).map((_, rIdx) => (
                  <Card key={rIdx} className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-3 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
                    <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] mb-2 uppercase">
                      Round {rIdx + 1}
                    </Text>
                    <View className="flex-row items-center justify-between bg-slate-50 dark:bg-zinc-950/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                      <View className="flex-1">
                        <Text className="text-slate-900 dark:text-white text-xs font-semibold" numberOfLines={1}>
                          {teams[rIdx % teams.length]?.name}
                        </Text>
                      </View>
                      <View className="px-2.5 py-0.5 bg-slate-200 dark:bg-zinc-800 rounded-full mx-2">
                        <Text className="text-slate-600 dark:text-zinc-400 text-[10px] font-bold">VS</Text>
                      </View>
                      <View className="flex-1 items-end">
                        <Text className="text-slate-900 dark:text-white text-xs font-semibold" numberOfLines={1}>
                          {teams[(rIdx + 1) % teams.length]?.name}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <Text className="text-slate-400 dark:text-zinc-500 text-xs">
                Need at least 2 teams to compute round-robin fixtures.
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }

  // Knockout Bracket
  const bracketSlots = Math.max(maxTeams || 8, 4);
  const quarterCount = Math.floor(bracketSlots / 2);

  return (
    <View className="space-y-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-slate-900 dark:text-white font-bold text-base">⚔️ Tournament Bracket Tree</Text>
        <Badge label="SINGLE ELIMINATION" variant="warning" size="sm" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
        <View className="flex-row gap-4 items-start">
          {/* Round 1 / Quarterfinals */}
          <View className="w-52 space-y-3">
            <View className="bg-slate-100 dark:bg-zinc-800/60 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-700/50">
              <Text className="text-slate-700 dark:text-zinc-300 text-xs font-bold text-center uppercase tracking-wider">
                {quarterCount >= 4 ? "Quarterfinals" : "Semifinals"}
              </Text>
            </View>

            {Array.from({ length: quarterCount }).map((_, mIdx) => {
              const team1 = teams[mIdx * 2];
              const team2 = teams[mIdx * 2 + 1];

              return (
                <Card
                  key={mIdx}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-2.5 rounded-2xl space-y-1.5 shadow-sm shadow-slate-200/50 dark:shadow-none"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold">MATCH {mIdx + 1}</Text>
                  </View>

                  {/* Team 1 */}
                  <View
                    className={`flex-row items-center justify-between p-2 rounded-xl ${
                      team1 ? "bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800" : "bg-slate-50/50 dark:bg-zinc-950/40 border border-dashed border-slate-200 dark:border-zinc-800/60"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold flex-1 mr-1 ${
                        team1 ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-600"
                      }`}
                      numberOfLines={1}
                    >
                      {team1 ? team1.name : "TBD / BYE"}
                    </Text>
                    {team1?.paid ? (
                      <View className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : null}
                  </View>

                  {/* Team 2 */}
                  <View
                    className={`flex-row items-center justify-between p-2 rounded-xl ${
                      team2 ? "bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800" : "bg-slate-50/50 dark:bg-zinc-950/40 border border-dashed border-slate-200 dark:border-zinc-800/60"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold flex-1 mr-1 ${
                        team2 ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-600"
                      }`}
                      numberOfLines={1}
                    >
                      {team2 ? team2.name : "TBD / BYE"}
                    </Text>
                    {team2?.paid ? (
                      <View className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : null}
                  </View>
                </Card>
              );
            })}
          </View>

          {/* Semifinals */}
          <View className="w-52 space-y-3">
            <View className="bg-slate-100 dark:bg-zinc-800/60 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-700/50">
              <Text className="text-slate-700 dark:text-zinc-300 text-xs font-bold text-center uppercase tracking-wider">
                Semifinals
              </Text>
            </View>

            {Array.from({ length: Math.max(Math.floor(quarterCount / 2), 2) }).map((_, sIdx) => (
              <Card
                key={sIdx}
                className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-2.5 rounded-2xl space-y-1.5 my-3 shadow-sm shadow-slate-200/50 dark:shadow-none"
              >
                <Text className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold">SEMI {sIdx + 1}</Text>
                <View className="bg-slate-50/50 dark:bg-zinc-950/40 p-2 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800/60">
                  <Text className="text-slate-500 dark:text-zinc-500 text-xs font-medium">Winner Match {sIdx * 2 + 1}</Text>
                </View>
                <View className="bg-slate-50/50 dark:bg-zinc-950/40 p-2 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800/60">
                  <Text className="text-slate-500 dark:text-zinc-500 text-xs font-medium">Winner Match {sIdx * 2 + 2}</Text>
                </View>
              </Card>
            ))}
          </View>

          {/* Championship Final */}
          <View className="w-56 space-y-3">
            <View className="bg-amber-50 dark:bg-amber-950/40 py-1.5 px-3 rounded-xl border border-amber-300 dark:border-amber-600/40">
              <Text className="text-amber-700 dark:text-amber-400 text-xs font-extrabold text-center uppercase tracking-wider">
                🏆 Grand Final
              </Text>
            </View>

            <Card className="bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-600/30 p-3.5 rounded-2xl space-y-2 my-8 shadow-md">
              <Text className="text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest text-center">
                CHAMPIONSHIP DECIDER
              </Text>
              <View className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-amber-200 dark:border-amber-500/20">
                <Text className="text-slate-900 dark:text-white text-xs font-bold text-center">Semi 1 Winner</Text>
              </View>
              <Text className="text-amber-600 dark:text-amber-400 text-[10px] font-bold text-center">VS</Text>
              <View className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-amber-200 dark:border-amber-500/20">
                <Text className="text-slate-900 dark:text-white text-xs font-bold text-center">Semi 2 Winner</Text>
              </View>

              {/* Champion Badge */}
              <View className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800 items-center">
                <Text className="text-slate-400 dark:text-zinc-500 text-[10px]">Estimated Champion</Text>
                <Text className="text-amber-600 dark:text-amber-400 font-black text-sm mt-0.5">
                  🥇 {teams[0]?.name || "TBD"}
                </Text>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
