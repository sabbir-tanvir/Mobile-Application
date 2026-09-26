import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Card, Badge, Skeleton, Button } from "@/components/ui";
import { BookingCard } from "@/components/booking/BookingCard";
import { formatTaka } from "@/lib/currency";
import type { DashboardReport } from "@/api/types/report.types";
import type { Booking } from "@/api/types/booking.types";
import type { Turf } from "@/api/types/turf.types";

interface AdminDashboardViewProps {
  report?: DashboardReport;
  isLoadingReport: boolean;
  bookings: Booking[];
  turfs: Turf[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  report,
  isLoadingReport,
  bookings,
  turfs,
}) => {
  const router = useRouter();

  const formatFin = (amountInPoisha?: number) => {
    if (amountInPoisha === undefined || amountInPoisha === null) return "৳0";
    return formatTaka(Math.round(amountInPoisha / 100));
  };

  return (
    <View className="space-y-5">
      {/* Role Indicator Banner */}
      <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5 flex-1 mr-2">
          <Text className="text-2xl">👑</Text>
          <View className="flex-1">
            <Text className="text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider" numberOfLines={1}>
              Executive Administrator
            </Text>
            <Text className="text-slate-600 dark:text-zinc-400 text-[11px]" numberOfLines={1}>
              Full financial, operational & partner authority
            </Text>
          </View>
        </View>
        <Badge label="Active" variant="paid" size="sm" />
      </View>

      {/* Financial KPIs Grid */}
      <View>
        <View className="flex-row items-center justify-between mb-2.5">
          <Text className="text-slate-800 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider">
            Financial Overview (Monthly)
          </Text>
          <Pressable onPress={() => router.push("/accounting" as any)}>
            <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              Accounting Hub →
            </Text>
          </Pressable>
        </View>

        {isLoadingReport ? (
          <View className="grid grid-cols-2 gap-2.5 mb-2">
            <Skeleton height={90} borderRadius={16} />
            <Skeleton height={90} borderRadius={16} />
            <Skeleton height={90} borderRadius={16} />
            <Skeleton height={90} borderRadius={16} />
          </View>
        ) : (
          <View className="grid grid-cols-2 gap-2.5">
            <Card className="p-3.5">
              <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Net Profit</Text>
              <Text className="text-emerald-600 dark:text-emerald-400 text-xl font-black mt-1">
                {formatFin(report?.netProfit)}
              </Text>
              <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">Current Month</Text>
            </Card>

            <Card className="p-3.5">
              <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Total Revenue</Text>
              <Text className="text-blue-600 dark:text-blue-400 text-xl font-black mt-1">
                {formatFin(report?.totalRevenue)}
              </Text>
              <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">Booking & Sales</Text>
            </Card>

            <Card className="p-3.5">
              <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Cash on Hand</Text>
              <Text className="text-amber-600 dark:text-amber-400 text-xl font-black mt-1">
                {formatFin(report?.totalCash)}
              </Text>
              <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">All Accounts</Text>
            </Card>

            <Card className="p-3.5">
              <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Receivables</Text>
              <Text className="text-purple-600 dark:text-purple-400 text-xl font-black mt-1">
                {formatFin(report?.totalReceivables)}
              </Text>
              <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">Unpaid Bookings</Text>
            </Card>
          </View>
        )}
      </View>

      {/* Operational Stats */}
      <View className="flex-row gap-2">
        <Card variant="surface" className="flex-1 p-2.5">
          <Text className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase font-bold" numberOfLines={1}>Turfs</Text>
          <Text className="text-slate-900 dark:text-white text-sm font-black mt-0.5" numberOfLines={1}>
            {turfs.length} Grounds
          </Text>
        </Card>

        <Card variant="surface" className="flex-1 p-2.5">
          <Text className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase font-bold" numberOfLines={1}>Bookings</Text>
          <Text className="text-slate-900 dark:text-white text-sm font-black mt-0.5" numberOfLines={1}>
            {report?.bookingCount ?? bookings.length} Total
          </Text>
        </Card>

        <Pressable
          onPress={() => router.push("/partners" as any)}
          className="flex-1 active:opacity-80"
        >
          <Card variant="surface" className="p-2.5 h-full">
            <Text className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase font-bold" numberOfLines={1}>Partners</Text>
            <Text className="text-purple-600 dark:text-purple-400 text-sm font-black mt-0.5" numberOfLines={1}>
              {report?.partnerCount ?? 1} Active
            </Text>
          </Card>
        </Pressable>
      </View>

      {/* Quick Admin Actions */}
      <Card className="p-4">
        <Text className="text-slate-800 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider mb-3">
          Quick Management Actions
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-2.5">
          <Button
            title="+ Booking"
            variant="primary"
            size="sm"
            onPress={() => router.push("/booking/create" as any)}
            className="w-[48%]"
          />
          <Button
            title="+ Add Pitch"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/turf/manage" as any)}
            className="w-[48%]"
          />
          <Button
            title="💳 Payments"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/payments" as any)}
            className="w-[48%]"
          />
          <Button
            title="👥 Customers"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/customers" as any)}
            className="w-[48%]"
          />
          <Button
            title="📊 Accounting"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/accounting" as any)}
            className="w-[48%]"
          />
          <Button
            title="🤝 Partners"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/partners" as any)}
            className="w-[48%]"
          />
          <Button
            title="🛍️ Retail POS"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/pos" as any)}
            className="w-[48%]"
          />
          <Button
            title="🏆 Tournaments"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/(tabs)/tournaments" as any)}
            className="w-[48%]"
          />
          <Button
            title="👥 User Access"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/users" as any)}
            className="w-[48%]"
          />
          <Button
            title="📈 Reports"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/reports" as any)}
            className="w-[48%]"
          />
        </View>
      </Card>

      {/* Recent Bookings Activity Feed */}
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-900 dark:text-white font-black text-lg">
            Live Reservation Feed
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/bookings")}>
            <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              View All ({bookings.length}) →
            </Text>
          </Pressable>
        </View>

        {bookings.slice(0, 4).map((b) => (
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
