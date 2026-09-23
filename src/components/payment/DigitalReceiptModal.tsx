import React from "react";
import { View, Text, Modal, Pressable, Platform, Share } from "react-native";
import { Card, Badge, Button } from "@/components/ui";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { PaymentItem } from "@/api/types/payment.types";

interface DigitalReceiptModalProps {
  visible: boolean;
  payment: PaymentItem | null;
  onClose: () => void;
}

const methodIcons: Record<string, string> = {
  bkash: "📱 bKash",
  nagad: "📲 Nagad",
  rocket: "🚀 Rocket",
  cash: "💵 Cash",
  card: "💳 Card",
  other: "📱 Digital",
};

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  visible,
  payment,
  onClose,
}) => {
  if (!payment) return null;

  const handleShare = async () => {
    const message = `🧾 TurfSlot Payment Receipt\n` +
      `Receipt #: RCP-${payment.id.slice(0, 8).toUpperCase()}\n` +
      `Customer: ${payment.customerName || "Customer"}\n` +
      `Amount: ৳${payment.amount.toLocaleString()}\n` +
      `Channel: ${payment.method.toUpperCase()}\n` +
      (payment.transactionId ? `Txn ID: ${payment.transactionId}\n` : "") +
      `Status: Verified / Completed\n` +
      `Date: ${formatDate(payment.createdAt)}`;

    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        window.alert("Receipt details copied to clipboard!");
      } else {
        window.alert(message);
      }
    } else {
      try {
        await Share.share({ message });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 items-center justify-center p-4">
        <View className="w-full max-w-sm">
          <Card className="bg-zinc-900 border-zinc-700 p-5 shadow-2xl shadow-black">
            {/* Header Badge */}
            <View className="items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 items-center justify-center mb-2">
                <Text className="text-2xl">✓</Text>
              </View>
              <Text className="text-white font-black text-xl">Payment Receipt</Text>
              <Text className="text-zinc-400 text-xs mt-0.5">
                TurfSlot Verified Transaction
              </Text>
            </View>

            {/* Receipt Details Box */}
            <View className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800 space-y-2.5 mb-4">
              <View className="flex-row justify-between items-center py-1 border-b border-zinc-800/80">
                <Text className="text-zinc-400 text-xs">Receipt No</Text>
                <Text className="text-zinc-200 font-mono text-xs font-bold">
                  RCP-{payment.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-zinc-800/80">
                <Text className="text-zinc-400 text-xs">Customer Name</Text>
                <Text className="text-white font-bold text-xs" numberOfLines={1}>
                  {payment.customerName || "Walking Customer"}
                </Text>
              </View>

              {payment.customerPhone ? (
                <View className="flex-row justify-between items-center py-1 border-b border-zinc-800/80">
                  <Text className="text-zinc-400 text-xs">Phone Number</Text>
                  <Text className="text-zinc-300 font-mono text-xs">
                    {payment.customerPhone}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row justify-between items-center py-1 border-b border-zinc-800/80">
                <Text className="text-zinc-400 text-xs">Payment Method</Text>
                <Text className="text-zinc-200 text-xs font-semibold">
                  {methodIcons[payment.method] || payment.method}
                </Text>
              </View>

              {payment.transactionId ? (
                <View className="flex-row justify-between items-center py-1 border-b border-zinc-800/80">
                  <Text className="text-zinc-400 text-xs">Transaction ID</Text>
                  <Text className="text-emerald-400 font-mono text-xs font-bold">
                    {payment.transactionId}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row justify-between items-center py-1 border-b border-zinc-800/80">
                <Text className="text-zinc-400 text-xs">Date & Time</Text>
                <Text className="text-zinc-300 text-xs">
                  {formatDate(payment.createdAt)}
                </Text>
              </View>

              {/* Total Amount Banner */}
              <View className="flex-row justify-between items-center pt-2">
                <Text className="text-zinc-200 font-bold text-sm">Amount Paid</Text>
                <Text className="text-emerald-400 font-black text-xl">
                  {formatTaka(payment.amount)}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-2">
              <Button
                title="Share Receipt"
                variant="primary"
                onPress={handleShare}
                className="flex-1"
              />
              <Button
                title="Close"
                variant="secondary"
                onPress={onClose}
                className="flex-1"
              />
            </View>
          </Card>
        </View>
      </View>
    </Modal>
  );
};
