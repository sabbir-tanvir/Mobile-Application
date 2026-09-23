import React, { useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Skeleton } from "@/components/ui";
import { usePartnerPayouts, useShareHistory } from "@/hooks/queries/usePartners";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export default function PartnerHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"payouts" | "reallocations">("payouts");

  const { data: payouts = [], isLoading: loadingPayouts, refetch: refetchPayouts, isRefetching: refetchingPayouts } =
    usePartnerPayouts();
  const { data: history = [], isLoading: loadingHistory, refetch: refetchHistory, isRefetching: refetchingHistory } =
    useShareHistory();

  return (
    <ScreenWrapper className="pb-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center active:bg-zinc-800"
          >
            <Text className="text-white text-base font-bold">←</Text>
          </Pressable>
          <View>
            <Text className="text-white text-xl font-black">Partner History</Text>
            <Text className="text-zinc-400 text-xs">
              Audit trail of payouts & equity reallocation
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row bg-zinc-900 p-1 rounded-2xl border border-zinc-800 mb-3.5">
        <Pressable
          onPress={() => setActiveTab("payouts")}
          className={`flex-1 py-2 rounded-xl items-center ${
            activeTab === "payouts" ? "bg-purple-600 shadow-md" : "bg-transparent"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === "payouts" ? "text-white" : "text-zinc-400"
            }`}
          >
            💸 Payouts Log ({payouts.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("reallocations")}
          className={`flex-1 py-2 rounded-xl items-center ${
            activeTab === "reallocations" ? "bg-purple-600 shadow-md" : "bg-transparent"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === "reallocations" ? "text-white" : "text-zinc-400"
            }`}
          >
            📜 Share History ({history.length})
          </Text>
        </Pressable>
      </View>

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <>
          {loadingPayouts ? (
            <View className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={70} borderRadius={16} />
              ))}
            </View>
          ) : (
            <FlatList
              data={payouts}
              keyExtractor={(item) => item.id}
              onRefresh={refetchPayouts}
              refreshing={refetchingPayouts}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Card className="bg-zinc-900/60 border-zinc-800 p-8 items-center justify-center my-6">
                  <Text className="text-3xl mb-2">💸</Text>
                  <Text className="text-zinc-300 font-bold text-sm">No payouts recorded yet</Text>
                  <Text className="text-zinc-500 text-xs text-center mt-1">
                    Partner dividend payouts will appear here after being disbursed
                  </Text>
                </Card>
              }
              renderItem={({ item }) => {
                const taka = (item.amount || 0) / 100;
                return (
                  <Card className="bg-zinc-900 border-zinc-800 p-3.5 mb-2.5">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-white font-bold text-sm" numberOfLines={1}>
                          {item.partnerName || "Partner Payout"}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <Text className="text-zinc-400 text-xs">
                            {item.entryDate ? formatDate(item.entryDate) : "—"}
                          </Text>
                          <Text className="text-zinc-600">•</Text>
                          <Badge
                            label={item.paymentMethod.replace("_", " ")}
                            variant="default"
                            size="sm"
                          />
                        </View>
                      </View>

                      <View className="items-end">
                        <Text className="text-purple-400 font-black text-base">
                          {formatTaka(taka)}
                        </Text>
                      </View>
                    </View>

                    {item.notes ? (
                      <View className="mt-2 pt-2 border-t border-zinc-800/80">
                        <Text className="text-zinc-500 text-[11px] italic">{item.notes}</Text>
                      </View>
                    ) : null}
                  </Card>
                );
              }}
            />
          )}
        </>
      )}

      {/* Reallocations Tab */}
      {activeTab === "reallocations" && (
        <>
          {loadingHistory ? (
            <View className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={80} borderRadius={16} />
              ))}
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id || String(item.version)}
              onRefresh={refetchHistory}
              refreshing={refetchingHistory}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Card className="bg-zinc-900/60 border-zinc-800 p-8 items-center justify-center my-6">
                  <Text className="text-3xl mb-2">📜</Text>
                  <Text className="text-zinc-300 font-bold text-sm">No reallocations recorded</Text>
                  <Text className="text-zinc-500 text-xs text-center mt-1">
                    Share reallocations will produce an immutable audit log entry
                  </Text>
                </Card>
              }
              renderItem={({ item }) => (
                <Card className="bg-zinc-900 border-zinc-800 p-3.5 mb-2.5">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-2">
                      <Badge label={`Version #${item.version}`} variant="info" size="sm" />
                      <Text className="text-zinc-400 text-xs">
                        {item.createdAt ? formatDate(item.createdAt) : "—"}
                      </Text>
                    </View>
                    <Text className="text-zinc-500 text-[11px] font-mono">
                      By: {item.changedBy ? item.changedBy.slice(0, 8) : "Admin"}
                    </Text>
                  </View>

                  <Text className="text-white font-medium text-xs mt-1.5">
                    Reason: {item.reason || "Periodic share reallocation"}
                  </Text>
                </Card>
              )}
            />
          )}
        </>
      )}
    </ScreenWrapper>
  );
}
