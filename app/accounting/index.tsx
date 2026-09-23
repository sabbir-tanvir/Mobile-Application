import React from "react";
import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Skeleton } from "@/components/ui";
import {
  useAccounts,
  useExpenses,
  useIncomes,
  useLedgerEntries,
} from "@/hooks/queries/useAccounting";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export default function AccountingHubScreen() {
  const router = useRouter();

  const { data: accounts = [], isLoading: loadingAccounts, refetch: refetchAccounts } = useAccounts();
  const { data: expenses = [], isLoading: loadingExpenses, refetch: refetchExpenses } = useExpenses();
  const { data: incomes = [], isLoading: loadingIncomes, refetch: refetchIncomes } = useIncomes();
  const { data: ledgerEntries = [], isLoading: loadingLedger, refetch: refetchLedger } = useLedgerEntries({ limit: 5 });

  const isRefreshing = false;
  const onRefresh = () => {
    refetchAccounts();
    refetchExpenses();
    refetchIncomes();
    refetchLedger();
  };

  // Convert amounts from Poisha (divide by 100)
  const totalExpenseTaka = expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / 100;
  const totalIncomeTaka = incomes.reduce((sum, i) => sum + (i.amount || 0), 0) / 100;
  const netManualFlow = totalIncomeTaka - totalExpenseTaka;

  return (
    <ScreenWrapper className="pb-6">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
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
              <Text className="text-white text-xl font-black">Financial Accounting</Text>
              <Text className="text-zinc-400 text-xs">
                Ledger, Accounts & Operational Cashflow
              </Text>
            </View>
          </View>
        </View>

        {/* Financial KPI Summary Cards */}
        <View className="flex-row gap-2.5 mb-4">
          <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3">
            <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              Total Incomes
            </Text>
            <Text className="text-emerald-400 font-black text-base mt-1" numberOfLines={1}>
              {formatTaka(totalIncomeTaka)}
            </Text>
            <Text className="text-zinc-500 text-[10px] mt-0.5">{incomes.length} logged</Text>
          </Card>

          <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3">
            <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              Total Expenses
            </Text>
            <Text className="text-red-400 font-black text-base mt-1" numberOfLines={1}>
              {formatTaka(totalExpenseTaka)}
            </Text>
            <Text className="text-zinc-500 text-[10px] mt-0.5">{expenses.length} logged</Text>
          </Card>

          <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3">
            <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              Net Flow
            </Text>
            <Text
              className={`font-black text-base mt-1 ${
                netManualFlow >= 0 ? "text-emerald-400" : "text-amber-400"
              }`}
              numberOfLines={1}
            >
              {formatTaka(netManualFlow)}
            </Text>
            <Text className="text-zinc-500 text-[10px] mt-0.5">Non-booking</Text>
          </Card>
        </View>

        {/* 4 Core Accounting Hub Modules */}
        <Text className="text-zinc-300 font-bold text-xs uppercase tracking-wider mb-2.5">
          Accounting Modules
        </Text>

        <View className="space-y-2.5 mb-5">
          {/* Chart of Accounts */}
          <Pressable
            onPress={() => router.push("/accounting/accounts" as any)}
            className="active:opacity-90"
          >
            <Card className="bg-zinc-900 border-zinc-800 p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5">
                <View className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 items-center justify-center">
                  <Text className="text-2xl">📑</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Chart of Accounts</Text>
                  <Text className="text-zinc-400 text-xs">
                    {accounts.length} active asset, liability & expense accounts
                  </Text>
                </View>
              </View>
              <Text className="text-zinc-500 text-lg font-bold">›</Text>
            </Card>
          </Pressable>

          {/* Expenses */}
          <Pressable
            onPress={() => router.push("/accounting/expenses" as any)}
            className="active:opacity-90"
          >
            <Card className="bg-zinc-900 border-zinc-800 p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5">
                <View className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 items-center justify-center">
                  <Text className="text-2xl">💸</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Business Expenses</Text>
                  <Text className="text-zinc-400 text-xs">
                    Log electricity, pitch maintenance, turf upkeep
                  </Text>
                </View>
              </View>
              <Text className="text-zinc-500 text-lg font-bold">›</Text>
            </Card>
          </Pressable>

          {/* Incomes */}
          <Pressable
            onPress={() => router.push("/accounting/incomes" as any)}
            className="active:opacity-90"
          >
            <Card className="bg-zinc-900 border-zinc-800 p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5">
                <View className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center">
                  <Text className="text-2xl">💰</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Manual Incomes</Text>
                  <Text className="text-zinc-400 text-xs">
                    Log sponsorships, billboard ads, vendor fees
                  </Text>
                </View>
              </View>
              <Text className="text-zinc-500 text-lg font-bold">›</Text>
            </Card>
          </Pressable>

          {/* General Ledger */}
          <Pressable
            onPress={() => router.push("/accounting/ledger" as any)}
            className="active:opacity-90"
          >
            <Card className="bg-zinc-900 border-zinc-800 p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5">
                <View className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 items-center justify-center">
                  <Text className="text-2xl">📖</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-base">General Ledger</Text>
                  <Text className="text-zinc-400 text-xs">
                    Complete double-entry journal lines and balances
                  </Text>
                </View>
              </View>
              <Text className="text-zinc-500 text-lg font-bold">›</Text>
            </Card>
          </Pressable>
        </View>

        {/* Live Journal Stream Header */}
        <View className="flex-row items-center justify-between mb-2.5">
          <Text className="text-white font-bold text-base">Recent Journal Entries</Text>
          <Pressable onPress={() => router.push("/accounting/ledger" as any)}>
            <Text className="text-emerald-400 text-xs font-semibold">View All →</Text>
          </Pressable>
        </View>

        {/* Recent Ledger Entries Snippet */}
        {loadingLedger ? (
          <View className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={65} borderRadius={14} />
            ))}
          </View>
        ) : ledgerEntries.length === 0 ? (
          <Card className="bg-zinc-900/60 border-zinc-800 p-6 items-center">
            <Text className="text-zinc-500 text-xs">No journal entries posted yet</Text>
          </Card>
        ) : (
          <View className="space-y-2">
            {ledgerEntries.slice(0, 3).map((entry) => {
              const totalDebitTaka =
                (entry.lines?.reduce((s, l) => s + (l.debit || 0), 0) || entry.totalDebit || 0) / 100;
              return (
                <Pressable
                  key={entry.id}
                  onPress={() => router.push("/accounting/ledger" as any)}
                  className="active:opacity-90"
                >
                  <Card className="bg-zinc-900/80 border-zinc-800 p-3 flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                      <Text className="text-white font-semibold text-xs" numberOfLines={1}>
                        {entry.description || "Journal Posting"}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-0.5">
                        <Text className="text-zinc-500 text-[11px]">
                          {formatDate(entry.entryDate)}
                        </Text>
                        <Badge label={entry.referenceType || "entry"} variant="default" size="sm" />
                      </View>
                    </View>
                    <Text className="text-emerald-400 font-bold text-xs">
                      {formatTaka(totalDebitTaka)}
                    </Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
