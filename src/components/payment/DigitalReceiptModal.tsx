import React from "react";
import { View, Text, Modal, Pressable, Platform, Share } from "react-native";
import { Card, Badge, Button } from "@/components/ui";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { showAlert } from "@/lib/alerts";
import { printBookingReceipt, shareBookingReceiptPdf, type BookingReceiptData } from "@/lib/invoicePrint";
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

  const getReceiptData = (): BookingReceiptData => ({
    receiptNo: payment.id ? payment.id.slice(0, 8).toUpperCase() : "RCP-0001",
    date: formatDate(payment.createdAt),
    bookingId: payment.bookingId,
    customerName: payment.customerName || "Valued Customer",
    customerPhone: payment.customerPhone,
    amount: payment.amount,
    method: payment.method,
    transactionId: payment.transactionId,
    status: payment.status || "COMPLETED",
  });

  const handlePrint = () => {
    printBookingReceipt(getReceiptData());
  };

  const handleSharePdf = () => {
    shareBookingReceiptPdf(getReceiptData());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 dark:bg-black/80 items-center justify-center p-4">
        <View className="w-full max-w-sm">
          <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none">
            {/* Header Badge */}
            <View className="items-center mb-4">
              <View className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 items-center justify-center mb-2 shadow-sm">
                <Text className="text-emerald-600 dark:text-emerald-400 text-2xl font-bold">✓</Text>
              </View>
              <Text className="text-slate-900 dark:text-white font-black text-xl tracking-tight">Payment Receipt</Text>
              <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5 font-medium">
                TurfSlot Verified Transaction
              </Text>
            </View>

            {/* Receipt Details Box */}
            <View className="bg-slate-50 dark:bg-zinc-950/80 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800/80 gap-2.5 mb-5">
              <View className="flex-row justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/80">
                <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Receipt No</Text>
                <Text className="text-slate-900 dark:text-zinc-200 font-mono text-xs font-bold">
                  RCP-{payment.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/80">
                <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Customer Name</Text>
                <Text className="text-slate-900 dark:text-white font-bold text-xs" numberOfLines={1}>
                  {payment.customerName || "Walking Customer"}
                </Text>
              </View>

              {payment.customerPhone ? (
                <View className="flex-row justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/80">
                  <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Phone Number</Text>
                  <Text className="text-slate-700 dark:text-zinc-300 font-mono text-xs">
                    {payment.customerPhone}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/80">
                <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Payment Method</Text>
                <Text className="text-slate-800 dark:text-zinc-200 text-xs font-semibold">
                  {methodIcons[payment.method] || payment.method}
                </Text>
              </View>

              {payment.transactionId ? (
                <View className="flex-row justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/80">
                  <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Transaction ID</Text>
                  <Text className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                    {payment.transactionId}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/80">
                <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Date & Time</Text>
                <Text className="text-slate-700 dark:text-zinc-300 text-xs">
                  {formatDate(payment.createdAt)}
                </Text>
              </View>

              {/* Total Amount Banner */}
              <View className="flex-row justify-between items-center pt-2">
                <Text className="text-slate-800 dark:text-zinc-200 font-bold text-sm">Amount Paid</Text>
                <Text className="text-emerald-600 dark:text-emerald-400 font-black text-xl">
                  {formatTaka(payment.amount)}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className="gap-2">
              <View className="flex-row gap-2">
                <Pressable
                  onPress={handlePrint}
                  className="flex-1 py-3 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700 border border-slate-200 dark:border-zinc-700 items-center justify-center flex-row gap-1.5"
                >
                  <Text className="text-slate-800 dark:text-white font-bold text-xs">🖨️ Print</Text>
                </Pressable>
                <Pressable
                  onPress={handleSharePdf}
                  className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 active:bg-emerald-700 shadow-sm shadow-emerald-600/30 items-center justify-center flex-row gap-1.5"
                >
                  <Text className="text-white font-bold text-xs">📤 Share PDF</Text>
                </Pressable>
              </View>

              <Button
                title="Close"
                variant="secondary"
                onPress={onClose}
                className="w-full"
              />
            </View>
          </Card>
        </View>
      </View>
    </Modal>
  );
};
