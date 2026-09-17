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
        <Text className="text-zinc-500 text-xs italic">
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
          className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 flex-row items-center justify-between mb-2"
        >
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-xs font-semibold">
                {getMethodIcon(record.method)}
              </Text>
              {record.txnId && (
                <Text className="text-zinc-400 text-[11px]">
                  Txn: {record.txnId}
                </Text>
              )}
            </View>
            <Text className="text-zinc-500 text-[11px] mt-1">
              {formatDate(record.date)} {record.note ? `• ${record.note}` : ""}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-emerald-400 font-bold text-sm">
              +{formatTaka(record.amount)}
            </Text>
            <Text className="text-emerald-500/80 text-[10px] font-medium uppercase">
              Paid
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
