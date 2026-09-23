import React, { useState } from "react";
import { View, Text, Pressable, FlatList, Modal, Alert, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Input, Skeleton } from "@/components/ui";
import {
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  usePartnerPayouts,
  useCreatePayout,
} from "@/hooks/queries/usePartners";
import { formatTaka } from "@/lib/currency";
import type { PartnerItem, CreatePartnerPayload, UpdatePartnerPayload } from "@/api/types/partner.types";

const PAYOUT_METHODS = ["bank_transfer", "cash", "bkash", "nagad"];

export default function PartnersScreen() {
  const router = useRouter();

  // Dialog State: Add / Edit Partner
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerPassword, setPartnerPassword] = useState("");
  const [partnerError, setPartnerError] = useState("");

  // Dialog State: Record Payout
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPartnerForPayout, setSelectedPartnerForPayout] = useState<PartnerItem | null>(null);
  const [payoutAmountTaka, setPayoutAmountTaka] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("bank_transfer");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [payoutError, setPayoutError] = useState("");

  const { data: partners = [], isLoading, isRefetching, refetch } = usePartners();
  const { data: allPayouts = [] } = usePartnerPayouts();
  const createPartnerMutation = useCreatePartner();
  const updatePartnerMutation = useUpdatePartner();
  const createPayoutMutation = useCreatePayout();

  // Metrics
  const totalPartners = partners.length;
  const totalBP = partners.reduce((sum, p) => sum + (p.shareBp || 0), 0);
  const totalPayoutsTaka = allPayouts.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

  const handleOpenAddPartner = () => {
    setEditingPartner(null);
    setPartnerName("");
    setPartnerEmail("");
    setPartnerPassword("");
    setPartnerError("");
    setShowPartnerModal(true);
  };

  const handleOpenEditPartner = (p: PartnerItem) => {
    setEditingPartner(p);
    setPartnerName(p.fullName);
    setPartnerEmail(p.email);
    setPartnerPassword("");
    setPartnerError("");
    setShowPartnerModal(true);
  };

  const handleSavePartner = async () => {
    if (!partnerName.trim()) {
      setPartnerError("Full name is required");
      return;
    }
    if (!partnerEmail.trim()) {
      setPartnerError("Email is required");
      return;
    }
    if (!editingPartner && !partnerPassword.trim()) {
      setPartnerError("Password is required for new partner");
      return;
    }

    try {
      setPartnerError("");
      if (editingPartner) {
        const payload: UpdatePartnerPayload = {
          fullName: partnerName.trim(),
          email: partnerEmail.trim(),
        };
        if (partnerPassword.trim()) {
          payload.password = partnerPassword.trim();
        }
        await updatePartnerMutation.mutateAsync({ id: editingPartner.id, payload });
      } else {
        const payload: CreatePartnerPayload = {
          fullName: partnerName.trim(),
          email: partnerEmail.trim(),
          password: partnerPassword.trim(),
        };
        await createPartnerMutation.mutateAsync(payload);
      }

      setShowPartnerModal(false);
      if (Platform.OS === "web") {
        window.alert(`Partner ${editingPartner ? "updated" : "created"} successfully!`);
      } else {
        Alert.alert("Success", `Partner ${editingPartner ? "updated" : "created"} successfully!`);
      }
    } catch (err: any) {
      setPartnerError(err.message || "Failed to save partner");
    }
  };

  const handleOpenPayout = (p: PartnerItem) => {
    setSelectedPartnerForPayout(p);
    setPayoutAmountTaka("");
    setPayoutMethod("bank_transfer");
    setPayoutNotes("");
    setPayoutError("");
    setShowPayoutModal(true);
  };

  const handleSavePayout = async () => {
    if (!selectedPartnerForPayout) return;
    const amt = parseFloat(payoutAmountTaka);
    if (!amt || amt <= 0) {
      setPayoutError("Please enter a valid payout amount");
      return;
    }

    try {
      setPayoutError("");
      await createPayoutMutation.mutateAsync({
        userId: selectedPartnerForPayout.id,
        amount: Math.round(amt * 100), // Poisha
        paymentMethod: payoutMethod,
        notes: payoutNotes.trim() || undefined,
      });

      setShowPayoutModal(false);
      if (Platform.OS === "web") {
        window.alert("Payout recorded successfully and posted to general ledger!");
      } else {
        Alert.alert("Success", "Payout recorded successfully and posted to general ledger!");
      }
    } catch (err: any) {
      setPayoutError(err.message || "Failed to record payout");
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
            <Text className="text-slate-900 dark:text-white text-xl font-black">Partner Shares</Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs">
              Equity distribution & dividend payouts
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleOpenAddPartner}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 border border-emerald-500 shadow-sm shadow-emerald-600/30 flex-row items-center"
        >
          <Text className="text-white font-bold text-xs">+ Partner</Text>
        </Pressable>
      </View>

      {/* Top Action Buttons (Reallocate & History) */}
      <View className="flex-row gap-2 mb-3.5">
        <Pressable
          onPress={() => router.push("/partners/reallocate" as any)}
          className="flex-1 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex-row items-center justify-center gap-1.5 shadow-sm shadow-slate-200/40 dark:shadow-none active:bg-slate-100 dark:active:bg-zinc-800"
        >
          <Text className="text-xs">⚖️</Text>
          <Text className="text-slate-800 dark:text-zinc-200 font-bold text-xs">Reallocate Shares</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/partners/history" as any)}
          className="flex-1 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex-row items-center justify-center gap-1.5 shadow-sm shadow-slate-200/40 dark:shadow-none active:bg-slate-100 dark:active:bg-zinc-800"
        >
          <Text className="text-xs">📜</Text>
          <Text className="text-slate-800 dark:text-zinc-200 font-bold text-xs">Payouts & History</Text>
        </Pressable>
      </View>

      {/* Overview Stat Cards */}
      <View className="flex-row gap-2.5 mb-4">
        <Card className="flex-1 bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none p-3.5">
          <Text className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Total Partners
          </Text>
          <Text className="text-slate-900 dark:text-white font-black text-lg mt-1">{totalPartners}</Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">Active</Text>
        </Card>

        <Card className="flex-1 bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none p-3.5">
          <Text className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Shares Allocated
          </Text>
          <Text
            className={`font-black text-lg mt-1 ${
              totalBP === 10000 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {(totalBP / 100).toFixed(0)}%
          </Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">{totalBP} / 10,000 BP</Text>
        </Card>

        <Card className="flex-1 bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none p-3.5">
          <Text className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Total Payouts
          </Text>
          <Text className="text-purple-600 dark:text-purple-400 font-black text-base mt-1" numberOfLines={1}>
            {formatTaka(totalPayoutsTaka)}
          </Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">{allPayouts.length} disbursements</Text>
        </Card>
      </View>

      {/* Partners List Header */}
      <Text className="text-slate-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider mb-2.5">
        Active Partners Roster
      </Text>

      {/* Partners FlatList */}
      {isLoading ? (
        <View className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={85} borderRadius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          data={partners}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 items-center justify-center my-6 shadow-sm shadow-slate-200/40 dark:shadow-none">
              <Text className="text-3xl mb-2">🤝</Text>
              <Text className="text-slate-800 dark:text-zinc-300 font-bold text-sm">No partners registered</Text>
              <Text className="text-slate-500 dark:text-zinc-500 text-xs text-center mt-1">
                Tap "+ Partner" to add equity partners and assign share ratios
              </Text>
            </Card>
          }
          renderItem={({ item }) => {
            const initial = item.fullName ? item.fullName[0].toUpperCase() : "?";
            const sharePercentage = (item.shareBp || 0) / 100;
            return (
              <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 mb-3 shadow-sm shadow-slate-200/50 dark:shadow-none">
                <View className="flex-row items-center justify-between">
                  {/* Left: Avatar & Info */}
                  <View className="flex-row items-center gap-3 flex-1 mr-2">
                    <View className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 dark:border-purple-500/30 items-center justify-center">
                      <Text className="text-purple-600 dark:text-purple-400 font-black text-lg">{initial}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-slate-900 dark:text-white font-black text-base" numberOfLines={1}>
                          {item.fullName}
                        </Text>
                        <Badge label={item.status} variant="success" size="sm" />
                      </View>
                      <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">{item.email}</Text>
                    </View>
                  </View>

                  {/* Right: Equity Pill */}
                  <View className="items-end bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 px-3 py-1.5 rounded-xl">
                    <Text className="text-purple-700 dark:text-purple-300 font-black text-sm">
                      {sharePercentage.toFixed(2)}%
                    </Text>
                    <Text className="text-slate-500 dark:text-zinc-400 text-[10px] font-mono">
                      {item.shareBp || 0} BP
                    </Text>
                  </View>
                </View>

                {/* Action Buttons Row */}
                <View className="flex-row gap-2 mt-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <Pressable
                    onPress={() => handleOpenPayout(item)}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 active:bg-purple-700 flex-row items-center justify-center gap-1.5 shadow-sm shadow-purple-600/30"
                  >
                    <Text className="text-white font-bold text-xs">💸 Record Payout</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleOpenEditPartner(item)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 active:bg-slate-200 dark:active:bg-zinc-700 flex-row items-center justify-center gap-1"
                  >
                    <Text className="text-slate-700 dark:text-zinc-300 font-bold text-xs">⚙️ Edit</Text>
                  </Pressable>
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Add / Edit Partner Modal */}
      <Modal visible={showPartnerModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 dark:bg-black/80 justify-end">
          <View className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl p-5 max-h-[90%] shadow-2xl">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-slate-900 dark:text-white font-black text-lg">
                {editingPartner ? "Edit Partner" : "Add New Partner"}
              </Text>
              <Pressable
                onPress={() => setShowPartnerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 items-center justify-center"
              >
                <Text className="text-slate-500 dark:text-zinc-400 font-bold">✕</Text>
              </Pressable>
            </View>

            {partnerError ? (
              <View className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl mb-3">
                <Text className="text-red-500 dark:text-red-400 text-xs font-semibold">{partnerError}</Text>
              </View>
            ) : null}

            <Input
              label="Full Name *"
              placeholder="e.g. Tanvir Hossain"
              value={partnerName}
              onChangeText={setPartnerName}
            />

            <Input
              label="Email Address *"
              placeholder="tanvir@example.com"
              value={partnerEmail}
              onChangeText={setPartnerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label={editingPartner ? "New Password (Optional)" : "Password *"}
              placeholder="••••••••"
              value={partnerPassword}
              onChangeText={setPartnerPassword}
              secureTextEntry
            />

            <View className="flex-row gap-2.5 mt-3">
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowPartnerModal(false)}
                className="flex-1"
              />
              <Button
                title={editingPartner ? "Update Partner" : "Create Partner"}
                variant="primary"
                loading={createPartnerMutation.isPending || updatePartnerMutation.isPending}
                onPress={handleSavePartner}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Record Payout Modal */}
      <Modal visible={showPayoutModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 dark:bg-black/80 justify-end">
          <View className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl p-5 max-h-[90%] shadow-2xl">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-slate-900 dark:text-white font-black text-lg">
                Record Payout for {selectedPartnerForPayout?.fullName}
              </Text>
              <Pressable
                onPress={() => setShowPayoutModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 items-center justify-center"
              >
                <Text className="text-slate-500 dark:text-zinc-400 font-bold">✕</Text>
              </Pressable>
            </View>

            {payoutError ? (
              <View className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl mb-3">
                <Text className="text-red-500 dark:text-red-400 text-xs font-semibold">{payoutError}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Payout Amount (BDT ৳) *"
                placeholder="25000"
                value={payoutAmountTaka}
                onChangeText={setPayoutAmountTaka}
                keyboardType="numeric"
              />

              {/* Payment Method Selector */}
              <Text className="text-slate-600 dark:text-zinc-400 text-xs mb-1.5 font-medium">Payment Channel *</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3.5">
                {PAYOUT_METHODS.map((m) => {
                  const isSelected = payoutMethod === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setPayoutMethod(m)}
                      className={`px-3 py-1.5 rounded-xl border uppercase ${
                        isSelected
                          ? "bg-purple-600 border-purple-500"
                          : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? "text-white" : "text-slate-700 dark:text-zinc-400"
                        }`}
                      >
                        {m.replace("_", " ")}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Input
                label="Notes / Transaction ID (Optional)"
                placeholder="Bank receipt # or remarks"
                value={payoutNotes}
                onChangeText={setPayoutNotes}
              />

              <View className="flex-row gap-2.5 mt-3 mb-4">
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setShowPayoutModal(false)}
                  className="flex-1"
                />
                <Button
                  title="Record Payout"
                  variant="primary"
                  loading={createPayoutMutation.isPending}
                  onPress={handleSavePayout}
                  className="flex-1 bg-purple-600 active:bg-purple-700"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
