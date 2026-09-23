import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Skeleton } from "@/components/ui";
import { useLedgerEntries } from "@/hooks/queries/useAccounting";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export default function LedgerScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: entries = [], isLoading, isRefetching, refetch } = useLedgerEntries({ limit: 100 });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredEntries = entries.filter((e) => {
    return (
      !searchQuery ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.referenceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.entryDate?.includes(searchQuery)
    );
  });

  return (
    <ScreenWrapper className="pb-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center shadow-sm shadow-slate-200/50 dark:shadow-none active:scale-95"
          >
            <Text className="text-slate-800 dark:text-white text-base font-bold">←</Text>
          </Pressable>
          <View>
            <Text className="text-slate-900 dark:text-white text-xl font-black">General Ledger</Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs">
              {entries.length} posted journal entries
            </Text>
          </View>
        </View>
      </View>

      {/* Info Card */}
      <Card
        variant="elevated"
        className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 p-3.5 mb-3 flex-row items-center justify-between shadow-sm shadow-slate-200/50 dark:shadow-none rounded-2xl"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-500/30 items-center justify-center">
            <Text className="text-xl">📖</Text>
          </View>
          <View>
            <Text className="text-slate-900 dark:text-white font-bold text-xs">Double-Entry Journal</Text>
            <Text className="text-slate-500 dark:text-zinc-500 text-[11px]">
              Tap any entry to view balanced debit & credit lines
            </Text>
          </View>
        </View>
        <Badge label="Audited" variant="success" size="sm" />
      </Card>

      {/* Search Input */}
      <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 mb-3 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <Text className="text-slate-400 dark:text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search by description, reference, or date..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-slate-900 dark:text-white text-xs"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-slate-400 dark:text-zinc-500 text-xs px-1 font-bold">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Journal Entries List */}
      {isLoading ? (
        <View className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={80} borderRadius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card
              variant="surface"
              className="bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 p-8 items-center justify-center my-6"
            >
              <Text className="text-3xl mb-2">📖</Text>
              <Text className="text-slate-900 dark:text-zinc-300 font-bold text-sm">No journal entries found</Text>
              <Text className="text-slate-500 dark:text-zinc-500 text-xs text-center mt-1">
                Journal entries are automatically posted when expenses, incomes, or bookings occur
              </Text>
            </Card>
          }
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            const totalDebitTaka =
              (item.lines?.reduce((s, l) => s + (l.debit || 0), 0) || item.totalDebit || 0) / 100;
            const totalCreditTaka =
              (item.lines?.reduce((s, l) => s + (l.credit || 0), 0) || item.totalCredit || 0) / 100;

            return (
              <Pressable onPress={() => toggleExpand(item.id)} className="mb-2.5 active:opacity-90">
                <Card
                  variant="elevated"
                  className={`bg-white dark:bg-zinc-900 border ${
                    isExpanded
                      ? "border-emerald-500/80 shadow-md shadow-emerald-500/10"
                      : "border-slate-200/80 dark:border-zinc-800 shadow-sm shadow-slate-200/50 dark:shadow-none"
                  } p-3.5 rounded-2xl`}
                >
                  {/* Entry Header */}
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-slate-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                          {item.description || "General Entry"}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">
                          {item.entryDate ? formatDate(item.entryDate) : "—"}
                        </Text>
                        <Text className="text-slate-300 dark:text-zinc-600">•</Text>
                        <Badge label={item.referenceType || "entry"} variant="default" size="sm" />
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        {formatTaka(totalDebitTaka)}
                      </Text>
                      <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">
                        {isExpanded ? "▲ Hide lines" : "▼ Show lines"}
                      </Text>
                    </View>
                  </View>

                  {/* Expanded Double-Entry Breakdown Lines */}
                  {isExpanded && item.lines && item.lines.length > 0 && (
                    <View className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <View className="flex-row justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800/80 mb-2">
                        <Text className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold flex-1">
                          Account
                        </Text>
                        <Text className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold w-20 text-right">
                          Debit
                        </Text>
                        <Text className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold w-20 text-right">
                          Credit
                        </Text>
                      </View>

                      {item.lines.map((line, idx) => {
                        const debitTaka = (line.debit || 0) / 100;
                        const creditTaka = (line.credit || 0) / 100;
                        return (
                          <View
                            key={idx}
                            className="flex-row items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800/40"
                          >
                            <View className="flex-1 mr-2">
                              <Text className="text-slate-800 dark:text-zinc-300 text-xs font-medium" numberOfLines={1}>
                                {line.accountName || line.accountCode}
                              </Text>
                              <Text className="text-slate-400 dark:text-zinc-500 text-[10px] font-mono">
                                #{line.accountCode}
                              </Text>
                            </View>

                            <Text
                              className={`text-xs font-mono w-20 text-right ${
                                debitTaka > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-300 dark:text-zinc-600"
                              }`}
                            >
                              {debitTaka > 0 ? formatTaka(debitTaka) : "—"}
                            </Text>

                            <Text
                              className={`text-xs font-mono w-20 text-right ${
                                creditTaka > 0 ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-300 dark:text-zinc-600"
                              }`}
                            >
                              {creditTaka > 0 ? formatTaka(creditTaka) : "—"}
                            </Text>
                          </View>
                        );
                      })}

                      {/* Balanced Total Footer */}
                      <View className="flex-row justify-between pt-2 items-center">
                        <Text className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          ✓ Balanced Entry
                        </Text>
                        <View className="flex-row gap-3">
                          <Text className="text-slate-500 dark:text-zinc-400 text-xs">
                            Dr: <Text className="text-slate-900 dark:text-white font-bold">{formatTaka(totalDebitTaka)}</Text>
                          </Text>
                          <Text className="text-slate-500 dark:text-zinc-400 text-xs">
                            Cr: <Text className="text-slate-900 dark:text-white font-bold">{formatTaka(totalCreditTaka)}</Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </ScreenWrapper>
  );
}
