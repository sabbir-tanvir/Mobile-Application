import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Button, Input, Skeleton } from "@/components/ui";
import { usePartners, useReallocateShares } from "@/hooks/queries/usePartners";
import type { ReallocatePayload } from "@/api/types/partner.types";

export default function ReallocateSharesScreen() {
  const router = useRouter();
  const { data: partners = [], isLoading } = usePartners();
  const reallocateMutation = useReallocateShares();

  const [shares, setShares] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize shares map from partners
  useEffect(() => {
    if (partners.length > 0) {
      const initial: Record<string, number> = {};
      partners.forEach((p) => {
        initial[p.id] = p.shareBp || 0;
      });
      setShares(initial);
    }
  }, [partners]);

  const handleShareChange = (partnerId: string, val: string) => {
    const num = parseInt(val, 10) || 0;
    setShares((prev) => ({
      ...prev,
      [partnerId]: Math.max(0, Math.min(10000, num)),
    }));
  };

  const handleStep = (partnerId: string, delta: number) => {
    setShares((prev) => {
      const current = prev[partnerId] || 0;
      const updated = Math.max(0, Math.min(10000, current + delta));
      return {
        ...prev,
        [partnerId]: updated,
      };
    });
  };

  const totalBP = Object.values(shares).reduce((sum, bp) => sum + bp, 0);
  const isBalanced = totalBP === 10000;

  const handleSubmit = async () => {
    if (!isBalanced) {
      setErrorMsg(`Total shares must equal 10,000 BP (currently ${totalBP} BP)`);
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("Please provide an audit reason for reallocation");
      return;
    }

    try {
      setErrorMsg("");
      const payload: ReallocatePayload = {
        shares: Object.keys(shares).map((userId) => ({
          userId,
          shareBp: shares[userId],
        })),
        reason: reason.trim(),
      };

      await reallocateMutation.mutateAsync(payload);

      if (Platform.OS === "web") {
        window.alert("Shares successfully reallocated and recorded in audit log!");
      } else {
        Alert.alert("Success", "Shares successfully reallocated and recorded in audit log!");
      }
      router.back();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reallocate shares");
    }
  };

  return (
    <ScreenWrapper className="pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
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
              <Text className="text-slate-900 dark:text-white text-xl font-black">Reallocate Shares</Text>
              <Text className="text-slate-500 dark:text-zinc-400 text-xs">
                Recalibrate partner equity distribution
              </Text>
            </View>
          </View>
        </View>

        {/* Live Balance Status Banner */}
        <Card
          className={`p-4 mb-4 border rounded-2xl ${
            isBalanced
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 shadow-sm shadow-emerald-500/10 dark:shadow-none"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 shadow-sm shadow-amber-500/10 dark:shadow-none"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <Text
                className={`font-black text-sm uppercase tracking-wider ${
                  isBalanced ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {isBalanced ? "✓ Equity Perfectly Balanced (100%)" : "⚠️ Reallocation Incomplete"}
              </Text>
              <Text className="text-slate-600 dark:text-zinc-400 text-xs mt-0.5">
                Total shares must equal exactly 10,000 Base Points (BP).
              </Text>
            </View>

            <View className="items-end">
              <Text
                className={`font-black text-xl ${
                  isBalanced ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {(totalBP / 100).toFixed(2)}%
              </Text>
              <Text className="text-slate-500 dark:text-zinc-500 text-[10px] font-mono">{totalBP} / 10,000 BP</Text>
            </View>
          </View>
        </Card>

        {errorMsg ? (
          <View className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl mb-4">
            <Text className="text-red-500 dark:text-red-400 text-xs font-semibold">{errorMsg}</Text>
          </View>
        ) : null}

        {/* Partners Share Steppers List */}
        <Text className="text-slate-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider mb-2.5">
          Partner Allocations
        </Text>

        {isLoading ? (
          <View className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={100} borderRadius={16} />
            ))}
          </View>
        ) : (
          <View className="space-y-3 mb-4">
            {partners.map((partner) => {
              const currentBp = shares[partner.id] ?? (partner.shareBp || 0);
              const percentage = (currentBp / 100).toFixed(2);
              const initial = partner.fullName ? partner.fullName[0].toUpperCase() : "?";

              return (
                <Card key={partner.id} className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm shadow-slate-200/50 dark:shadow-none">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                      <View className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 dark:border-purple-500/30 items-center justify-center">
                        <Text className="text-purple-600 dark:text-purple-400 font-bold text-base">{initial}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                          {partner.fullName}
                        </Text>
                        <Text className="text-slate-500 dark:text-zinc-500 text-xs">{partner.email}</Text>
                      </View>
                    </View>

                    {/* Live % Pill */}
                    <View className="bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 px-3 py-1 rounded-xl items-end">
                      <Text className="text-purple-700 dark:text-purple-300 font-black text-sm">{percentage}%</Text>
                    </View>
                  </View>

                  {/* Stepper Controls and Numeric Input */}
                  <View className="flex-row items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <View className="flex-row items-center gap-1.5">
                      <Pressable
                        onPress={() => handleStep(partner.id, -500)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700"
                      >
                        <Text className="text-slate-700 dark:text-zinc-300 text-xs font-bold">-500</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleStep(partner.id, -100)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700"
                      >
                        <Text className="text-slate-700 dark:text-zinc-300 text-xs font-bold">-100</Text>
                      </Pressable>
                    </View>

                    {/* Numeric Input */}
                    <View className="flex-row items-center gap-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1">
                      <TextInput
                        value={String(currentBp)}
                        onChangeText={(v) => handleShareChange(partner.id, v)}
                        keyboardType="numeric"
                        className="text-slate-900 dark:text-white font-mono font-bold text-sm w-16 text-center"
                      />
                      <Text className="text-slate-500 dark:text-zinc-500 text-xs font-mono">BP</Text>
                    </View>

                    <View className="flex-row items-center gap-1.5">
                      <Pressable
                        onPress={() => handleStep(partner.id, 100)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700"
                      >
                        <Text className="text-slate-700 dark:text-zinc-300 text-xs font-bold">+100</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleStep(partner.id, 500)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700"
                      >
                        <Text className="text-slate-700 dark:text-zinc-300 text-xs font-bold">+500</Text>
                      </Pressable>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Reason for Reallocation Input */}
        <Input
          label="Reason for Share Reallocation *"
          placeholder="e.g. Q3 Equity adjustment or capital injection"
          value={reason}
          onChangeText={setReason}
        />

        {/* Action Button */}
        <Button
          title={isBalanced ? "Save & Apply Reallocation" : `Balance Required (${totalBP}/10,000 BP)`}
          variant="primary"
          disabled={!isBalanced || !reason.trim() || reallocateMutation.isPending}
          loading={reallocateMutation.isPending}
          onPress={handleSubmit}
          className={`w-full mt-2 ${!isBalanced ? "opacity-50" : ""}`}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
