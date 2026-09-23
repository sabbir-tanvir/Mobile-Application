import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, Modal, Alert, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Input, Skeleton } from "@/components/ui";
import {
  useExpenses,
  useCreateExpense,
  useDeleteExpense,
  useAccounts,
} from "@/hooks/queries/useAccounting";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { CreateExpensePayload } from "@/api/types/accounting.types";

const PAYMENT_METHODS = ["cash", "bkash", "nagad", "rocket", "card"];

export default function ExpensesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Record Expense Modal State
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [amountTaka, setAmountTaka] = useState("");
  const [accountCode, setAccountCode] = useState("6099");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: expenses = [], isLoading, isRefetching, refetch } = useExpenses();
  const { data: accounts = [] } = useAccounts();
  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const expenseAccounts = accounts.filter((a) => a.type === "expense");

  // Summary
  const totalExpenseTaka = expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / 100;

  // Filtered
  const filteredExpenses = expenses.filter((e) => {
    return (
      !searchQuery ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.accountCode?.includes(searchQuery)
    );
  });

  const handleOpenModal = () => {
    setErrorMsg("");
    setDescription("");
    setAmountTaka("");
    setNotes("");
    setEntryDate(new Date().toISOString().split("T")[0]);
    if (expenseAccounts.length > 0) {
      setAccountCode(expenseAccounts[0].code);
    } else {
      setAccountCode("6099");
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const amtNum = parseFloat(amountTaka);
    if (!amtNum || amtNum <= 0) {
      setErrorMsg("Please enter a valid amount");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Description is required");
      return;
    }
    if (!entryDate.trim()) {
      setErrorMsg("Date is required");
      return;
    }

    try {
      setErrorMsg("");
      const payload: CreateExpensePayload = {
        description: description.trim(),
        amount: Math.round(amtNum * 100), // Convert Taka to Poisha
        accountCode: accountCode || "6099",
        paymentMethod,
        entryDate: entryDate.trim(),
        notes: notes.trim() || undefined,
      };

      await createExpenseMutation.mutateAsync(payload);
      setShowModal(false);

      if (Platform.OS === "web") {
        window.alert("Expense recorded successfully!");
      } else {
        Alert.alert("Success", "Expense recorded successfully!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record expense");
    }
  };

  const handleDelete = (id: string, desc: string) => {
    const confirmMessage = `Delete expense "${desc}"? This will automatically post a reversal journal entry to the ledger.`;
    if (Platform.OS === "web") {
      if (window.confirm(confirmMessage)) {
        deleteExpenseMutation.mutate(id);
      }
    } else {
      Alert.alert("Delete Expense", confirmMessage, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteExpenseMutation.mutate(id),
        },
      ]);
    }
  };

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
            <Text className="text-slate-900 dark:text-white text-xl font-black">Business Expenses</Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs">
              {expenses.length} expense transactions
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleOpenModal}
          className="px-3.5 py-2 rounded-xl bg-rose-600 active:bg-rose-700 border border-rose-500 shadow-sm shadow-rose-950/20 flex-row items-center"
        >
          <Text className="text-white font-bold text-xs">+ Record</Text>
        </Pressable>
      </View>

      {/* Summary KPI Card */}
      <Card
        variant="elevated"
        className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 p-4 mb-3.5 flex-row items-center justify-between shadow-sm shadow-slate-200/50 dark:shadow-none rounded-2xl"
      >
        <View>
          <Text className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Total Logged Expenses
          </Text>
          <Text className="text-rose-600 dark:text-rose-400 font-black text-2xl mt-1">
            {formatTaka(totalExpenseTaka)}
          </Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-xs mt-0.5">
            {expenses.length} operational disbursements
          </Text>
        </View>
        <View className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-500/30 items-center justify-center">
          <Text className="text-2xl">💸</Text>
        </View>
      </Card>

      {/* Search Input */}
      <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 mb-3 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <Text className="text-slate-400 dark:text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search by description or account code..."
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

      {/* Expenses List */}
      {isLoading ? (
        <View className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={75} borderRadius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card
              variant="surface"
              className="bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 p-8 items-center justify-center my-6"
            >
              <Text className="text-3xl mb-2">💸</Text>
              <Text className="text-slate-900 dark:text-zinc-300 font-bold text-sm">No expenses logged yet</Text>
              <Text className="text-slate-500 dark:text-zinc-500 text-xs text-center mt-1">
                Tap "+ Record" to log electricity, turf upkeep or refreshments
              </Text>
            </Card>
          }
          renderItem={({ item }) => {
            const taka = (item.amount || 0) / 100;
            return (
              <Card
                variant="elevated"
                className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 p-3.5 mb-2.5 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-slate-900 dark:text-white font-bold text-sm" numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">
                        {item.entryDate ? formatDate(item.entryDate) : "—"}
                      </Text>
                      <Text className="text-slate-300 dark:text-zinc-600">•</Text>
                      <Text className="text-emerald-700 dark:text-emerald-400 font-mono text-xs font-semibold">
                        Code: {item.accountCode}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-rose-600 dark:text-rose-400 font-black text-base">
                      -{formatTaka(taka)}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Badge label={item.paymentMethod} variant="default" size="sm" />
                      <Pressable
                        onPress={() => handleDelete(item.id, item.description)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 items-center justify-center active:bg-rose-50 dark:active:bg-red-500/20"
                      >
                        <Text className="text-rose-500 text-xs font-bold">🗑️</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {item.notes ? (
                  <View className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    <Text className="text-slate-500 dark:text-zinc-400 text-[11px] italic">{item.notes}</Text>
                  </View>
                ) : null}
              </Card>
            );
          }}
        />
      )}

      {/* Record Expense Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl p-5 max-h-[90%] shadow-2xl">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-slate-900 dark:text-white font-black text-lg">Record Business Expense</Text>
              <Pressable
                onPress={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 items-center justify-center active:scale-95"
              >
                <Text className="text-slate-500 dark:text-zinc-400 font-bold">✕</Text>
              </Pressable>
            </View>

            {errorMsg ? (
              <View className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-3">
                <Text className="text-red-600 dark:text-red-400 text-xs font-semibold">{errorMsg}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Description *"
                placeholder="e.g. Floodlight bulbs replacement"
                value={description}
                onChangeText={setDescription}
              />

              <Input
                label="Amount (BDT ৳) *"
                placeholder="1500"
                value={amountTaka}
                onChangeText={setAmountTaka}
                keyboardType="numeric"
              />

              <Input
                label="Date (YYYY-MM-DD) *"
                placeholder="2026-09-23"
                value={entryDate}
                onChangeText={setEntryDate}
              />

              {/* Expense Account Selector */}
              <Text className="text-slate-700 dark:text-zinc-400 text-xs mb-1.5 font-medium">Expense Account Code</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 mb-3.5">
                {(expenseAccounts.length > 0 ? expenseAccounts : [{ code: "6099", name: "Misc Expense" }]).map((acc) => {
                  const isSelected = accountCode === acc.code;
                  return (
                    <Pressable
                      key={acc.code}
                      onPress={() => setAccountCode(acc.code)}
                      className={`px-3 py-1.5 rounded-xl border ${
                        isSelected
                          ? "bg-rose-600 border-rose-500 shadow-sm shadow-rose-600/30"
                          : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        {acc.code} - {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Payment Method Selector */}
              <Text className="text-slate-700 dark:text-zinc-400 text-xs mb-1.5 font-medium">Disbursement Method</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3.5">
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = paymentMethod === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setPaymentMethod(m)}
                      className={`px-3 py-1.5 rounded-xl border uppercase ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                          : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Input
                label="Notes (Optional)"
                placeholder="Receipt # or vendor details"
                value={notes}
                onChangeText={setNotes}
              />

              <View className="flex-row gap-2.5 mt-3 mb-4">
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setShowModal(false)}
                  className="flex-1"
                />
                <Button
                  title="Save Expense"
                  variant="primary"
                  loading={createExpenseMutation.isPending}
                  onPress={handleSubmit}
                  className="flex-1 bg-rose-600 active:bg-rose-700"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
