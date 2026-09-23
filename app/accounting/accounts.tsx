import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, Modal, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Input, Skeleton } from "@/components/ui";
import { useAccounts, useCreateAccount } from "@/hooks/queries/useAccounting";
import type { AccountType, NormalSide, CreateAccountPayload } from "@/api/types/accounting.types";

const ACCOUNT_TYPES: Array<"all" | AccountType> = [
  "all",
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
];

const CODE_PREFIXES: Record<AccountType, string> = {
  asset: "1",
  liability: "2",
  equity: "3",
  revenue: "4",
  cogs: "5",
  expense: "6",
};

export default function AccountsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | AccountType>("all");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("expense");
  const [normalSide, setNormalSide] = useState<NormalSide>("debit");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: accounts = [], isLoading, isRefetching, refetch } = useAccounts();
  const createAccountMutation = useCreateAccount();

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      !searchQuery ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.code.includes(searchQuery);

    const matchesType = selectedType === "all" || acc.type === selectedType;

    return matchesSearch && matchesType;
  });

  const handleOpenAdd = () => {
    setErrorMsg("");
    setCode(CODE_PREFIXES[type] + "00");
    setName("");
    setDescription("");
    setShowAddModal(true);
  };

  const handleTypeSelect = (newType: AccountType) => {
    setType(newType);
    setNormalSide(newType === "asset" || newType === "expense" || newType === "cogs" ? "debit" : "credit");
    if (!code || code.length <= 1) {
      setCode(CODE_PREFIXES[newType] + "00");
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setErrorMsg("Account code is required");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Account name is required");
      return;
    }

    const expectedPrefix = CODE_PREFIXES[type];
    if (!code.startsWith(expectedPrefix)) {
      setErrorMsg(`Code for ${type} must start with digit '${expectedPrefix}' (e.g. ${expectedPrefix}050)`);
      return;
    }

    try {
      setErrorMsg("");
      const payload: CreateAccountPayload = {
        code: code.trim(),
        name: name.trim(),
        type,
        normalSide,
        description: description.trim() || undefined,
      };

      await createAccountMutation.mutateAsync(payload);
      setShowAddModal(false);

      if (Platform.OS === "web") {
        window.alert("Account created successfully!");
      } else {
        Alert.alert("Success", "Account created successfully!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account");
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
            <Text className="text-white text-xl font-black">Chart of Accounts</Text>
            <Text className="text-zinc-400 text-xs">
              {accounts.length} general ledger accounts
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleOpenAdd}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 border border-emerald-500 shadow-md shadow-emerald-950 flex-row items-center"
        >
          <Text className="text-white font-bold text-xs">+ Add Account</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 mb-3">
        <Text className="text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search account by code or name..."
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

      {/* Type Filter Chips */}
      <View className="flex-row flex-wrap gap-1.5 mb-3.5">
        {ACCOUNT_TYPES.map((t) => {
          const isSelected = selectedType === t;
          return (
            <Pressable
              key={t}
              onPress={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full border ${
                isSelected
                  ? "bg-emerald-600 border-emerald-500"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Text
                className={`text-xs font-semibold capitalize ${
                  isSelected ? "text-white" : "text-zinc-400"
                }`}
              >
                {t}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Accounts List */}
      {isLoading ? (
        <View className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={60} borderRadius={14} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredAccounts}
          keyExtractor={(item) => item.id || item.code}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card className="bg-zinc-900/60 border-zinc-800 p-8 items-center justify-center my-6">
              <Text className="text-3xl mb-2">📑</Text>
              <Text className="text-zinc-300 font-bold text-sm">No accounts found</Text>
              <Text className="text-zinc-500 text-xs text-center mt-1">
                {searchQuery
                  ? "Try searching with a different keyword"
                  : "No accounts match this filter"}
              </Text>
            </Card>
          }
          renderItem={({ item }) => (
            <Card className="bg-zinc-900 border-zinc-800 p-3 mb-2 flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {item.code}
                  </Text>
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                {item.description ? (
                  <Text className="text-zinc-400 text-xs mt-1" numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
              </View>

              <View className="items-end gap-1">
                <Badge
                  label={item.type}
                  variant={
                    item.type === "asset"
                      ? "success"
                      : item.type === "expense"
                      ? "danger"
                      : item.type === "revenue"
                      ? "info"
                      : "warning"
                  }
                  size="sm"
                />
                <Text className="text-zinc-500 text-[10px] capitalize font-mono">
                  {item.normalSide} normal
                </Text>
              </View>
            </Card>
          )}
        />
      )}

      {/* Add Account Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-black text-lg">Add New Account</Text>
              <Pressable
                onPress={() => setShowAddModal(false)}
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

            {/* Type Picker */}
            <Text className="text-zinc-400 text-xs mb-1.5">Account Type *</Text>
            <View className="flex-row flex-wrap gap-1.5 mb-3.5">
              {ACCOUNT_TYPES.filter((t) => t !== "all").map((t) => {
                const isSelected = type === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => handleTypeSelect(t as AccountType)}
                    className={`px-3 py-1.5 rounded-xl border capitalize ${
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
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              label={`Account Code * (Must start with ${CODE_PREFIXES[type]})`}
              placeholder={`e.g. ${CODE_PREFIXES[type]}050`}
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
            />

            <Input
              label="Account Name *"
              placeholder="e.g. Turf Light Bulbs & Maintenance"
              value={name}
              onChangeText={setName}
            />

            {/* Normal Side Picker */}
            <Text className="text-zinc-400 text-xs mb-1.5">Normal Side *</Text>
            <View className="flex-row gap-2 mb-3.5">
              {(["debit", "credit"] as NormalSide[]).map((side) => {
                const isSelected = normalSide === side;
                return (
                  <Pressable
                    key={side}
                    onPress={() => setNormalSide(side)}
                    className={`flex-1 py-2 rounded-xl border items-center capitalize ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-500"
                        : "bg-zinc-950 border-zinc-800"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      {side}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              label="Description (Optional)"
              placeholder="Operational details about this account"
              value={description}
              onChangeText={setDescription}
            />

            <View className="flex-row gap-2.5 mt-3">
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowAddModal(false)}
                className="flex-1"
              />
              <Button
                title="Create Account"
                variant="primary"
                loading={createAccountMutation.isPending}
                onPress={handleSubmit}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
