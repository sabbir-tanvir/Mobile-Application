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
      <View className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl">💼</Text>
          <View>
            <Text className="text-blue-400 font-bold text-xs uppercase tracking-wider">
              Partner / Stakeholder Portal
            </Text>
            <Text className="text-zinc-400 text-[11px]">
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
      <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-blue-500/40 p-5 shadow-lg shadow-blue-950/20">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
            My Dividend & Profit Summary
          </Text>
          <Text className="text-blue-400 text-xs font-bold">
            Ratio: {myShare?.effectivePct ?? 100}%
          </Text>
        </View>

        {isLoadingReport ? (
          <Skeleton height={100} borderRadius={12} />
        ) : (
          <View className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/80 space-y-3">
            <View className="flex-row justify-between items-center pb-2 border-b border-zinc-800/60">
              <Text className="text-zinc-400 text-sm">Gross Share Earned</Text>
              <Text className="text-white font-black text-lg">
                {formatFin(myShare?.grossShare ?? report?.netProfit)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center pb-2 border-b border-zinc-800/60">
              <Text className="text-zinc-400 text-sm">Total Paid Out to Date</Text>
              <Text className="text-emerald-400 font-bold text-base">
                {formatFin(myShare?.paidOut ?? 0)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center pt-1">
              <Text className="text-zinc-300 font-bold text-sm">
                Outstanding Balance Due
              </Text>
              <Text className="text-amber-400 font-extrabold text-lg">
                {formatFin(myShare?.outstanding ?? report?.netProfit)}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Venue Overall Performance */}
      <View>
        <Text className="text-zinc-300 font-bold text-sm uppercase tracking-wider mb-2.5">
          Overall Turf Business Performance
        </Text>
        <View className="flex-row gap-3">
          <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3.5">
            <Text className="text-zinc-400 text-xs font-medium">Business Revenue</Text>
            <Text className="text-blue-400 text-lg font-black mt-1">
              {formatFin(report?.totalRevenue)}
            </Text>
            <Text className="text-zinc-500 text-[10px] mt-0.5">Gross Income</Text>
          </Card>

          <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3.5">
            <Text className="text-zinc-400 text-xs font-medium">Net Venue Profit</Text>
            <Text className="text-emerald-400 text-lg font-black mt-1">
              {formatFin(report?.netProfit)}
            </Text>
            <Text className="text-zinc-500 text-[10px] mt-0.5">Before Distributions</Text>
          </Card>
        </View>
      </View>

      {/* Bookings Activity */}
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white font-bold text-base">
            Recent Ground Bookings
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/bookings")}>
            <Text className="text-blue-400 text-xs font-semibold">
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
