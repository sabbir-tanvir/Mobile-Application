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
          <Text className="text-white font-bold text-base">
            {format === "league" ? "🏆 League Table & Fixtures" : "⚡ Group Standings"}
          </Text>
          <Badge label={format.replace("_", " ").toUpperCase()} variant="info" size="sm" />
        </View>

        {teams.length === 0 ? (
          <Card className="p-6 bg-zinc-900/60 border-dashed border-zinc-800 items-center">
            <Text className="text-zinc-500 text-sm text-center">
              Register teams to generate the round-robin schedule and standings table.
            </Text>
          </Card>
        ) : (
          <View className="space-y-3">
            {/* Standings Table */}
            <Card className="bg-zinc-900 border-zinc-800 p-0 overflow-hidden">
              <View className="flex-row bg-zinc-950 px-3 py-2.5 border-b border-zinc-800">
                <Text className="text-zinc-400 text-xs font-bold w-8">#</Text>
                <Text className="text-zinc-400 text-xs font-bold flex-1">Team</Text>
                <Text className="text-zinc-400 text-xs font-bold w-10 text-center">P</Text>
                <Text className="text-zinc-400 text-xs font-bold w-10 text-center">W</Text>
                <Text className="text-zinc-400 text-xs font-bold w-12 text-center">PTS</Text>
              </View>

              {teams.map((team, idx) => (
                <View
                  key={idx}
                  className={`flex-row items-center px-3 py-2.5 border-b border-zinc-800/50 ${
                    idx === 0 ? "bg-emerald-950/20" : ""
                  }`}
                >
                  <Text
                    className={`text-xs font-extrabold w-8 ${
                      idx === 0 ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  >
                    {idx + 1}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-xs" numberOfLines={1}>
                      {team.name}
                    </Text>
                    <Text className="text-zinc-500 text-[10px]" numberOfLines={1}>
                      C: {team.captainName}
                    </Text>
                  </View>
                  <Text className="text-zinc-300 text-xs w-10 text-center">0</Text>
                  <Text className="text-zinc-300 text-xs w-10 text-center">0</Text>
                  <Text className="text-emerald-400 font-bold text-xs w-12 text-center">0</Text>
                </View>
              ))}
            </Card>

            {/* Generated Round Fixtures */}
            <Text className="text-zinc-400 text-xs font-semibold uppercase mt-2">
              📅 Match Fixtures
            </Text>
            {teams.length >= 2 ? (
              <View className="space-y-2">
                {Array.from({ length: Math.min(teams.length - 1, 3) }).map((_, rIdx) => (
                  <Card key={rIdx} className="bg-zinc-900 border-zinc-800/80 p-3">
                    <Text className="text-emerald-400 font-bold text-[11px] mb-2 uppercase">
                      Round {rIdx + 1}
                    </Text>
                    <View className="flex-row items-center justify-between bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                      <View className="flex-1">
                        <Text className="text-white text-xs font-semibold" numberOfLines={1}>
                          {teams[rIdx % teams.length]?.name}
                        </Text>
                      </View>
                      <View className="px-2 py-0.5 bg-zinc-800 rounded-full mx-2">
                        <Text className="text-zinc-400 text-[10px] font-bold">VS</Text>
                      </View>
                      <View className="flex-1 items-end">
                        <Text className="text-white text-xs font-semibold" numberOfLines={1}>
                          {teams[(rIdx + 1) % teams.length]?.name}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <Text className="text-zinc-500 text-xs">
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
        <Text className="text-white font-bold text-base">⚔️ Tournament Bracket Tree</Text>
        <Badge label="SINGLE ELIMINATION" variant="warning" size="sm" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
        <View className="flex-row gap-4 items-start">
          {/* Round 1 / Quarterfinals */}
          <View className="w-52 space-y-3">
            <View className="bg-zinc-800/60 py-1.5 px-3 rounded-lg border border-zinc-700/50">
              <Text className="text-zinc-300 text-xs font-bold text-center uppercase tracking-wider">
                {quarterCount >= 4 ? "Quarterfinals" : "Semifinals"}
              </Text>
            </View>

            {Array.from({ length: quarterCount }).map((_, mIdx) => {
              const team1 = teams[mIdx * 2];
              const team2 = teams[mIdx * 2 + 1];

              return (
                <Card
                  key={mIdx}
                  className="bg-zinc-900 border-zinc-800 p-2.5 rounded-xl space-y-1.5 shadow-sm"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-zinc-500 text-[10px] font-bold">MATCH {mIdx + 1}</Text>
                  </View>

                  {/* Team 1 */}
                  <View
                    className={`flex-row items-center justify-between p-2 rounded-lg ${
                      team1 ? "bg-zinc-950 border border-zinc-800" : "bg-zinc-950/40 border border-dashed border-zinc-800/60"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold flex-1 mr-1 ${
                        team1 ? "text-white" : "text-zinc-600"
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
                    className={`flex-row items-center justify-between p-2 rounded-lg ${
                      team2 ? "bg-zinc-950 border border-zinc-800" : "bg-zinc-950/40 border border-dashed border-zinc-800/60"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold flex-1 mr-1 ${
                        team2 ? "text-white" : "text-zinc-600"
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
            <View className="bg-zinc-800/60 py-1.5 px-3 rounded-lg border border-zinc-700/50">
              <Text className="text-zinc-300 text-xs font-bold text-center uppercase tracking-wider">
                Semifinals
              </Text>
            </View>

            {Array.from({ length: Math.max(Math.floor(quarterCount / 2), 2) }).map((_, sIdx) => (
              <Card
                key={sIdx}
                className="bg-zinc-900 border-zinc-800 p-2.5 rounded-xl space-y-1.5 my-3 shadow-sm"
              >
                <Text className="text-zinc-500 text-[10px] font-bold">SEMI {sIdx + 1}</Text>
                <View className="bg-zinc-950/40 p-2 rounded-lg border border-dashed border-zinc-800/60">
                  <Text className="text-zinc-500 text-xs font-medium">Winner Match {sIdx * 2 + 1}</Text>
                </View>
                <View className="bg-zinc-950/40 p-2 rounded-lg border border-dashed border-zinc-800/60">
                  <Text className="text-zinc-500 text-xs font-medium">Winner Match {sIdx * 2 + 2}</Text>
                </View>
              </Card>
            ))}
          </View>

          {/* Championship Final */}
          <View className="w-56 space-y-3">
            <View className="bg-amber-950/40 py-1.5 px-3 rounded-lg border border-amber-600/40">
              <Text className="text-amber-400 text-xs font-extrabold text-center uppercase tracking-wider">
                🏆 Grand Final
              </Text>
            </View>

            <Card className="bg-zinc-900 border-amber-600/30 p-3 rounded-xl space-y-2 my-8 shadow-md">
              <Text className="text-amber-400 text-[10px] font-black uppercase tracking-widest text-center">
                CHAMPIONSHIP DECIDER
              </Text>
              <View className="bg-zinc-950 p-2.5 rounded-lg border border-amber-500/20">
                <Text className="text-white text-xs font-bold text-center">Semi 1 Winner</Text>
              </View>
              <Text className="text-amber-400 text-[10px] font-bold text-center">VS</Text>
              <View className="bg-zinc-950 p-2.5 rounded-lg border border-amber-500/20">
                <Text className="text-white text-xs font-bold text-center">Semi 2 Winner</Text>
              </View>

              {/* Champion Badge */}
              <View className="mt-3 pt-2 border-t border-zinc-800 items-center">
                <Text className="text-zinc-500 text-[10px]">Estimated Champion</Text>
                <Text className="text-amber-400 font-black text-sm mt-0.5">
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
