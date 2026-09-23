import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, ScrollView, Modal, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Input, Skeleton } from "@/components/ui";
import { usePayments, useCreatePayment } from "@/hooks/queries/usePayments";
import { useBookings } from "@/hooks/queries/useBookings";
import { DigitalReceiptModal } from "@/components/payment/DigitalReceiptModal";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { PaymentItem, CreatePaymentPayload } from "@/api/types/payment.types";
import type { PaymentMethod } from "@/api/types/booking.types";

const PAYMENT_CHANNELS = ["All", "bkash", "nagad", "rocket", "cash", "card"];
const STATUS_FILTERS = ["all", "completed", "pending", "refunded"];

const methodBadges: Record<string, { label: string; icon: string }> = {
  bkash: { label: "bKash", icon: "📱" },
  nagad: { label: "Nagad", icon: "📲" },
  rocket: { label: "Rocket", icon: "🚀" },
  cash: { label: "Cash", icon: "💵" },
  card: { label: "Card", icon: "💳" },
  other: { label: "Other", icon: "📱" },
};

export default function PaymentsScreen() {
  const router = useRouter();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Selected receipt modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);

  // Manual payment recording modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [recordAmount, setRecordAmount] = useState("");
  const [recordMethod, setRecordMethod] = useState<PaymentMethod>("bkash");
  const [recordTxnId, setRecordTxnId] = useState("");
  const [recordCustomer, setRecordCustomer] = useState("");
  const [recordPhone, setRecordPhone] = useState("");
  const [recordError, setRecordError] = useState("");

  const { data: payments = [], isLoading: loadingPayments, refetch, isRefetching } = usePayments();
  const { data: bookings = [] } = useBookings();
  const createPaymentMutation = useCreatePayment();

  // Summary Metrics
  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalCollected = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Filtered List
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerPhone?.includes(searchQuery) ||
      p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel =
      selectedChannel === "All" ||
      p.method?.toLowerCase() === selectedChannel.toLowerCase();

    const matchesStatus =
      selectedStatus === "all" || p.status?.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const handleOpenRecordModal = () => {
    setRecordError("");
    setRecordAmount("");
    setRecordTxnId("");
    setRecordCustomer("");
    setRecordPhone("");
    setSelectedBookingId("");
    setShowRecordModal(true);
  };

  const handleRecordSubmit = async () => {
    const amountNum = parseFloat(recordAmount);
    if (!amountNum || amountNum <= 0) {
      setRecordError("Please enter a valid amount");
      return;
    }

    try {
      setRecordError("");
      const payload: CreatePaymentPayload = {
        bookingId: selectedBookingId || undefined,
        amount: amountNum,
        method: recordMethod,
        transactionId: recordTxnId.trim() || undefined,
        customerName: recordCustomer.trim() || undefined,
        customerPhone: recordPhone.trim() || undefined,
        status: "completed",
      };

      await createPaymentMutation.mutateAsync(payload);
      setShowRecordModal(false);

      if (Platform.OS === "web") {
        window.alert("Payment successfully recorded!");
      } else {
        Alert.alert("Success", "Payment successfully recorded!");
      }
    } catch (err: any) {
      setRecordError(err.message || "Failed to record payment");
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
            <Text className="text-slate-900 dark:text-white text-xl font-black">Payments Hub</Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs">
              {payments.length} transactions recorded
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleOpenRecordModal}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 border border-emerald-500 shadow-sm shadow-emerald-950/20 flex-row items-center"
        >
          <Text className="text-white font-bold text-xs">+ Record</Text>
        </Pressable>
      </View>

      {/* Financial KPI Summary Cards */}
      <View className="flex-row gap-3 mb-4">
        <Card
          variant="elevated"
          className="flex-1 bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 p-3.5 shadow-sm shadow-slate-200/50 dark:shadow-none rounded-2xl"
        >
          <Text className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Total Collected
          </Text>
          <Text className="text-emerald-600 dark:text-emerald-400 font-black text-lg mt-1" numberOfLines={1}>
            {formatTaka(totalCollected)}
          </Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">
            {completedPayments.length} paid txns
          </Text>
        </Card>

        <Card
          variant="elevated"
          className="flex-1 bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 p-3.5 shadow-sm shadow-slate-200/50 dark:shadow-none rounded-2xl"
        >
          <Text className="text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            Pending Dues
          </Text>
          <Text className="text-amber-500 dark:text-amber-400 font-black text-lg mt-1" numberOfLines={1}>
            {formatTaka(totalPending)}
          </Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">
            {pendingPayments.length} pending
          </Text>
        </Card>
      </View>

      {/* Search Input */}
      <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 mb-3 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <Text className="text-slate-400 dark:text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search customer, phone, or transaction ID..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-slate-900 dark:text-white text-xs"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-slate-400 dark:text-zinc-500 text-xs font-bold px-1">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Channel Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
        {PAYMENT_CHANNELS.map((ch) => {
          const isSelected = selectedChannel === ch;
          const badge = methodBadges[ch];
          return (
            <Pressable
              key={ch}
              onPress={() => setSelectedChannel(ch)}
              className={`px-3 py-1.5 rounded-full border flex-row items-center ${
                isSelected
                  ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm shadow-slate-200/40 dark:shadow-none"
              }`}
            >
              {badge?.icon && <Text className="mr-1 text-xs">{badge.icon}</Text>}
              <Text
                className={`text-xs font-semibold uppercase ${
                  isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                {ch}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Status Tabs */}
      <View className="flex-row gap-2 mb-3.5">
        {STATUS_FILTERS.map((st) => {
          const isSelected = selectedStatus === st;
          return (
            <Pressable
              key={st}
              onPress={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg border ${
                isSelected
                  ? "bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                  : "bg-slate-100 dark:bg-zinc-950 border-slate-200 dark:border-zinc-900"
              }`}
            >
              <Text
                className={`text-xs capitalize font-medium ${
                  isSelected ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-zinc-500"
                }`}
              >
                {st}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Payments List */}
      {loadingPayments ? (
        <View className="space-y-3">
          <Skeleton height={80} borderRadius={16} />
          <Skeleton height={80} borderRadius={16} />
          <Skeleton height={80} borderRadius={16} />
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => {
            const badge = methodBadges[item.method] || { label: item.method, icon: "📱" };

            return (
              <Pressable
                onPress={() => setSelectedPayment(item)}
                className="mb-3 active:scale-[0.99] transition-transform"
              >
                <Card
                  variant="elevated"
                  className="bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none"
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-1 mr-2">
                      <Text className="text-slate-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                        {item.customerName || "Customer Payment"}
                      </Text>
                      {item.customerPhone ? (
                        <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">
                          {item.customerPhone}
                        </Text>
                      ) : null}
                    </View>

                    {/* Amount */}
                    <Text className="text-emerald-600 dark:text-emerald-400 font-black text-base">
                      {formatTaka(item.amount)}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs">{badge.icon}</Text>
                      <Text className="text-slate-700 dark:text-zinc-300 text-xs font-semibold capitalize">
                        {badge.label}
                      </Text>
                      {item.transactionId && (
                        <Text className="text-slate-400 dark:text-zinc-500 text-[10px] font-mono">
                          • {item.transactionId}
                        </Text>
                      )}
                    </View>

                    <Text className="text-slate-400 dark:text-zinc-500 text-[10px]">
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Card
              variant="surface"
              className="items-center justify-center py-12 bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800"
            >
              <Text className="text-4xl mb-3">💳</Text>
              <Text className="text-slate-900 dark:text-white font-bold text-base">
                No payments found
              </Text>
              <Text className="text-slate-500 dark:text-zinc-500 text-xs mt-1 text-center px-4">
                No transactions matching your search criteria.
              </Text>
            </Card>
          }
        />
      )}

      {/* Digital Receipt Modal */}
      <DigitalReceiptModal
        visible={Boolean(selectedPayment)}
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />

      {/* Manual Payment Recording Modal */}
      <Modal
        visible={showRecordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecordModal(false)}
      >
        <View className="flex-1 bg-black/70 items-center justify-center p-4">
          <View className="w-full max-w-sm">
            <Card
              variant="elevated"
              className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 p-5 shadow-2xl rounded-3xl"
            >
              <Text className="text-slate-900 dark:text-white font-black text-lg mb-1">
                Record Payment
              </Text>
              <Text className="text-slate-500 dark:text-zinc-400 text-xs mb-4">
                Log a walk-in, cash, or mobile banking transaction
              </Text>

              {recordError ? (
                <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 mb-3">
                  <Text className="text-red-600 dark:text-red-400 text-xs font-medium">{recordError}</Text>
                </View>
              ) : null}

              {/* Optional Link to Booking */}
              {bookings.filter((b) => b.paymentStatus !== "paid").length > 0 && (
                <View className="mb-3">
                  <Text className="text-slate-700 dark:text-zinc-400 text-xs mb-1 font-medium">Link to Unpaid Booking (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5">
                    {bookings
                      .filter((b) => b.paymentStatus !== "paid")
                      .slice(0, 5)
                      .map((bk) => {
                        const isSelected = selectedBookingId === String(bk.id);
                        return (
                          <Pressable
                            key={bk.id}
                            onPress={() => {
                              if (isSelected) {
                                setSelectedBookingId("");
                              } else {
                                setSelectedBookingId(String(bk.id));
                                setRecordCustomer(bk.customerName);
                                setRecordPhone(bk.customerPhone);
                                setRecordAmount(String(Math.max(0, bk.totalPrice - bk.paidAmount)));
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg border ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-500"
                                : "bg-slate-100 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                            }`}
                          >
                            <Text
                              className={`text-[10px] font-medium ${
                                isSelected ? "text-white" : "text-slate-700 dark:text-zinc-300"
                              }`}
                            >
                              #{bk.id} {bk.customerName}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </ScrollView>
                </View>
              )}

              <Input
                label="Amount (BDT ৳) *"
                placeholder="2000"
                keyboardType="numeric"
                value={recordAmount}
                onChangeText={setRecordAmount}
              />

              <Input
                label="Customer Name"
                placeholder="e.g. Sabbir Hossain"
                value={recordCustomer}
                onChangeText={setRecordCustomer}
              />

              <Input
                label="Customer Phone"
                placeholder="017XXXXXXXX"
                value={recordPhone}
                onChangeText={setRecordPhone}
                keyboardType="phone-pad"
              />

              {/* Payment Method Selector */}
              <Text className="text-slate-700 dark:text-zinc-400 text-xs mb-1.5 font-medium">Payment Method</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-3">
                {PAYMENT_CHANNELS.filter((c) => c !== "All").map((ch) => {
                  const isSelected = recordMethod === ch;
                  const badge = methodBadges[ch];
                  return (
                    <Pressable
                      key={ch}
                      onPress={() => setRecordMethod(ch as PaymentMethod)}
                      className={`px-3 py-1.5 rounded-xl border flex-row items-center ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                          : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      <Text className="mr-1 text-xs">{badge.icon}</Text>
                      <Text
                        className={`text-xs font-semibold uppercase ${
                          isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        {ch}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Input
                label="Transaction ID (Optional)"
                placeholder="e.g. TRX987654"
                value={recordTxnId}
                onChangeText={setRecordTxnId}
                autoCapitalize="characters"
              />

              <View className="flex-row gap-2 mt-2">
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setShowRecordModal(false)}
                  className="flex-1"
                />
                <Button
                  title="Confirm"
                  variant="primary"
                  loading={createPaymentMutation.isPending}
                  onPress={handleRecordSubmit}
                  className="flex-1"
                />
              </View>
            </Card>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
