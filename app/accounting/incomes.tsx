import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, Modal, Alert, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Input, Skeleton } from "@/components/ui";
import {
  useIncomes,
  useCreateIncome,
  useDeleteIncome,
  useAccounts,
} from "@/hooks/queries/useAccounting";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { CreateIncomePayload } from "@/api/types/accounting.types";

const PAYMENT_METHODS = ["cash", "bkash", "nagad", "rocket", "card"];

export default function IncomesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Record Income Modal State
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [amountTaka, setAmountTaka] = useState("");
  const [accountCode, setAccountCode] = useState("4099");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: incomes = [], isLoading, isRefetching, refetch } = useIncomes();
  const { data: accounts = [] } = useAccounts();
  const createIncomeMutation = useCreateIncome();
  const deleteIncomeMutation = useDeleteIncome();

  const revenueAccounts = accounts.filter((a) => a.type === "revenue");

  // Summary
  const totalIncomeTaka = incomes.reduce((sum, i) => sum + (i.amount || 0), 0) / 100;

  // Filtered
  const filteredIncomes = incomes.filter((i) => {
    return (
      !searchQuery ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.accountCode?.includes(searchQuery)
    );
  });

  const handleOpenModal = () => {
    setErrorMsg("");
    setDescription("");
    setAmountTaka("");
    setNotes("");
    setEntryDate(new Date().toISOString().split("T")[0]);
    if (revenueAccounts.length > 0) {
      setAccountCode(revenueAccounts[0].code);
    } else {
      setAccountCode("4099");
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
      const payload: CreateIncomePayload = {
        description: description.trim(),
        amount: Math.round(amtNum * 100), // Convert Taka to Poisha
        accountCode: accountCode || "4099",
        paymentMethod,
        entryDate: entryDate.trim(),
        notes: notes.trim() || undefined,
      };

      await createIncomeMutation.mutateAsync(payload);
      setShowModal(false);

      if (Platform.OS === "web") {
        window.alert("Income recorded successfully!");
      } else {
        Alert.alert("Success", "Income recorded successfully!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record income");
    }
  };

  const handleDelete = (id: string, desc: string) => {
    const confirmMessage = `Delete income "${desc}"? This will automatically post a reversal journal entry to the ledger.`;
    if (Platform.OS === "web") {
      if (window.confirm(confirmMessage)) {
        deleteIncomeMutation.mutate(id);
      }
    } else {
      Alert.alert("Delete Income", confirmMessage, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteIncomeMutation.mutate(id),
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
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center active:bg-zinc-800"
          >
            <Text className="text-white text-base font-bold">←</Text>
          </Pressable>
          <View>
            <Text className="text-white text-xl font-black">Manual Incomes</Text>
            <Text className="text-zinc-400 text-xs">
              {incomes.length} non-booking collections
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleOpenModal}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 border border-emerald-500 shadow-md shadow-emerald-950 flex-row items-center"
        >
          <Text className="text-white font-bold text-xs">+ Record</Text>
        </Pressable>
      </View>

      {/* Summary KPI Card */}
      <Card className="bg-zinc-900 border-zinc-800 p-4 mb-3.5 flex-row items-center justify-between">
        <View>
          <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Total Logged Incomes
          </Text>
          <Text className="text-emerald-400 font-black text-2xl mt-1">
            {formatTaka(totalIncomeTaka)}
          </Text>
          <Text className="text-zinc-500 text-xs mt-0.5">
            {incomes.length} miscellaneous collections
          </Text>
        </View>
        <View className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center">
          <Text className="text-2xl">💰</Text>
        </View>
      </Card>

      {/* Search Input */}
      <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 mb-3">
        <Text className="text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search by description or account code..."
          placeholderTextColor="#71717a"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-white text-xs"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-zinc-400 text-xs px-1">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Incomes List */}
      {isLoading ? (
        <View className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={75} borderRadius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredIncomes}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card className="bg-zinc-900/60 border-zinc-800 p-8 items-center justify-center my-6">
              <Text className="text-3xl mb-2">💰</Text>
              <Text className="text-zinc-300 font-bold text-sm">No incomes logged yet</Text>
              <Text className="text-zinc-500 text-xs text-center mt-1">
                Tap "+ Record" to log sponsorships, vendor fees or event bookings
              </Text>
            </Card>
          }
          renderItem={({ item }) => {
            const taka = (item.amount || 0) / 100;
            return (
              <Card className="bg-zinc-900 border-zinc-800 p-3.5 mb-2.5">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-white font-bold text-sm" numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className="text-zinc-400 text-xs">
                        {item.entryDate ? formatDate(item.entryDate) : "—"}
                      </Text>
                      <Text className="text-zinc-600">•</Text>
                      <Text className="text-emerald-400 font-mono text-xs">
                        Code: {item.accountCode}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-emerald-400 font-black text-base">
                      +{formatTaka(taka)}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Badge label={item.paymentMethod} variant="default" size="sm" />
                      <Pressable
                        onPress={() => handleDelete(item.id, item.description)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 items-center justify-center active:bg-red-500/20"
                      >
                        <Text className="text-red-400 text-xs font-bold">🗑️</Text>
                      </Pressable>
                    </View>
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

      {/* Record Income Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-black text-lg">Record Manual Income</Text>
              <Pressable
                onPress={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center"
              >
                <Text className="text-zinc-400 font-bold">✕</Text>
              </Pressable>
            </View>

            {errorMsg ? (
              <View className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl mb-3">
                <Text className="text-red-400 text-xs font-semibold">{errorMsg}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Description *"
                placeholder="e.g. Ground Banner Sponsorship - Brand X"
                value={description}
                onChangeText={setDescription}
              />

              <Input
                label="Amount (BDT ৳) *"
                placeholder="5000"
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

              {/* Revenue Account Selector */}
              <Text className="text-zinc-400 text-xs mb-1.5">Revenue Account Code</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 mb-3.5">
                {(revenueAccounts.length > 0 ? revenueAccounts : [{ code: "4099", name: "Misc Revenue" }]).map((acc) => {
                  const isSelected = accountCode === acc.code;
                  return (
                    <Pressable
                      key={acc.code}
                      onPress={() => setAccountCode(acc.code)}
                      className={`px-3 py-1.5 rounded-xl border ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-500"
                          : "bg-zinc-950 border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {acc.code} - {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Payment Method Selector */}
              <Text className="text-zinc-400 text-xs mb-1.5">Collection Method</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3.5">
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = paymentMethod === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setPaymentMethod(m)}
                      className={`px-3 py-1.5 rounded-xl border uppercase ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-500"
                          : "bg-zinc-950 border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-zinc-400"
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
                placeholder="Invoice # or contact details"
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
                  title="Save Income"
                  variant="primary"
                  loading={createIncomeMutation.isPending}
                  onPress={handleSubmit}
                  className="flex-1 bg-emerald-600 active:bg-emerald-700"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
