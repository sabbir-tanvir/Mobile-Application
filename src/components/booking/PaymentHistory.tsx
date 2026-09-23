import React from "react";
import { View, Text } from "react-native";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { PaymentRecord } from "@/api/types/booking.types";

export interface PaymentHistoryProps {
  history: PaymentRecord[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <View className="py-3 items-center justify-center">
        <Text className="text-slate-400 dark:text-zinc-500 text-xs italic">
          No payments recorded yet
        </Text>
      </View>
    );
  }

  const getMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "bkash":
        return "📱 bKash";
      case "nagad":
        return "📲 Nagad";
      case "rocket":
        return "🚀 Rocket";
      case "cash":
        return "💵 Cash";
      case "card":
        return "💳 Card";
      default:
        return "💳 " + (method || "Payment");
    }
  };

  return (
    <View className="space-y-2">
      {history.map((record, index) => (
        <View
          key={index}
          className="bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 flex-row items-center justify-between mb-2 shadow-xs"
        >
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-slate-900 dark:text-white text-xs font-semibold">
                {getMethodIcon(record.method)}
              </Text>
              {record.txnId && (
                <Text className="text-slate-500 dark:text-zinc-400 text-[11px] font-mono">
                  Txn: {record.txnId}
                </Text>
              )}
            </View>
            <Text className="text-slate-400 dark:text-zinc-500 text-[11px] mt-1">
              {formatDate(record.date)} {record.note ? `• ${record.note}` : ""}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              +{formatTaka(record.amount)}
            </Text>
            <Text className="text-emerald-600/80 dark:text-emerald-500/80 text-[10px] font-semibold uppercase">
              Paid
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
