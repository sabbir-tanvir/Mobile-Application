import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Card, Badge, Skeleton, Button } from "@/components/ui";
import { BookingCard } from "@/components/booking/BookingCard";
import { formatTaka } from "@/lib/currency";
import type { DashboardReport } from "@/api/types/report.types";
import type { Booking } from "@/api/types/booking.types";

interface PartnerDashboardViewProps {
  report?: DashboardReport;
  isLoadingReport: boolean;
  bookings: Booking[];
}

export const PartnerDashboardView: React.FC<PartnerDashboardViewProps> = ({
  report,
  isLoadingReport,
  bookings,
}) => {
  const router = useRouter();
  const myShare = report?.myShare;

  // Matches web client Dashboard.jsx formatCurrency: divides poisha by 100
  const formatFin = (amountInPoisha?: number) => {
    if (amountInPoisha === undefined || amountInPoisha === null) return "৳0";
    return formatTaka(Math.round(amountInPoisha / 100));
  };

  return (
    <View className="space-y-6">
      {/* Role Banner */}
      <View className="bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 rounded-2xl p-3.5 flex-row items-center justify-between shadow-sm shadow-blue-500/5">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-xl bg-blue-500/20 items-center justify-center">
            <Text className="text-lg">💼</Text>
          </View>
          <View>
            <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
              Partner / Stakeholder Portal
            </Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-[11px]">
              Profit share & dividend monitoring
            </Text>
          </View>
        </View>
        <Badge
          label={`${myShare?.effectivePct ?? 100}% Share`}
          variant="partial"
          size="sm"
        />
      </View>

      {/* Primary My Profit Share Card */}
      <Card
        variant="elevated"
        className="bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border-blue-500/30 dark:border-blue-500/40 p-5 shadow-md shadow-blue-500/10 dark:shadow-blue-950/20"
      >
        <View className="flex-row items-center justify-between mb-3.5">
          <Text className="text-slate-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            My Dividend & Profit Summary
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">
            Ratio: {myShare?.effectivePct ?? 100}%
          </Text>
        </View>

        {isLoadingReport ? (
          <Skeleton height={110} borderRadius={12} />
        ) : (
          <View className="bg-slate-50 dark:bg-zinc-950/80 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800/80 space-y-3">
            <View className="flex-row justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-zinc-800/60">
              <Text className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
                Gross Share Earned
              </Text>
              <Text className="text-slate-900 dark:text-white font-black text-lg">
                {formatFin(myShare?.grossShare ?? report?.netProfit)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-zinc-800/60">
              <Text className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
                Total Paid Out to Date
              </Text>
              <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
                {formatFin(myShare?.paidOut ?? 0)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center pt-1">
              <Text className="text-slate-800 dark:text-zinc-300 font-bold text-sm">
                Outstanding Balance Due
              </Text>
              <Text className="text-amber-500 dark:text-amber-400 font-extrabold text-lg">
                {formatFin(myShare?.outstanding ?? report?.netProfit)}
              </Text>
            </View>
          </View>
        )}

        <Pressable
          onPress={() => router.push("/partners/history" as any)}
          className="mt-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/40 items-center justify-center active:opacity-80"
        >
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">
            📜 View Dividend & Payout History →
          </Text>
        </Pressable>
      </Card>

      {/* Venue Overall Performance */}
      <View>
        <Text className="text-slate-700 dark:text-zinc-300 font-bold text-sm uppercase tracking-wider mb-3">
          Overall Turf Business Performance
        </Text>
        <View className="flex-row gap-3">
          <Card
            variant="elevated"
            className="flex-1 bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 p-4 shadow-sm"
          >
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">
              Business Revenue
            </Text>
            <Text className="text-blue-600 dark:text-blue-400 text-lg font-black mt-1">
              {formatFin(report?.totalRevenue)}
            </Text>
            <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5 font-medium">
              Gross Income
            </Text>
          </Card>

          <Card
            variant="elevated"
            className="flex-1 bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 p-4 shadow-sm"
          >
            <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">
              Net Venue Profit
            </Text>
            <Text className="text-emerald-600 dark:text-emerald-400 text-lg font-black mt-1">
              {formatFin(report?.netProfit)}
            </Text>
            <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5 font-medium">
              Before Distributions
            </Text>
          </Card>
        </View>

        <Pressable
          onPress={() => router.push("/reports" as any)}
          className="mt-3 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center shadow-sm active:opacity-80"
        >
          <Text className="text-slate-700 dark:text-zinc-300 font-bold text-xs">
            📊 View Complete P&L & Financial Statements →
          </Text>
        </Pressable>
      </View>

      {/* Bookings Activity */}
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-900 dark:text-white font-bold text-base">
            Recent Ground Bookings
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/bookings")}>
            <Text className="text-blue-600 dark:text-blue-400 text-xs font-semibold">
              View All →
            </Text>
          </Pressable>
        </View>

        {bookings.slice(0, 3).map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            onPress={(id) => router.push(`/booking/${id}` as any)}
          />
        ))}
      </View>
    </View>
  );
};
