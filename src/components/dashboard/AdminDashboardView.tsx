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

  // Matches web client Dashboard.jsx formatCurrency: divides poisha by 100
  const formatFin = (amountInPoisha?: number) => {
    if (amountInPoisha === undefined || amountInPoisha === null) return "৳0";
    return formatTaka(Math.round(amountInPoisha / 100));
  };

  return (
    <View className="space-y-6">
      {/* Role Indicator Banner */}
      <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl">👑</Text>
          <View>
            <Text className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
              Executive Administrator
            </Text>
            <Text className="text-zinc-400 text-[11px]">
              Full financial, operational & partner authority
            </Text>
          </View>
        </View>
        <Badge label="Active Mode" variant="paid" size="sm" />
      </View>

      {/* Financial KPIs Grid (matching web Dashboard.jsx) */}
      <View>
        <View className="flex-row items-center justify-between mb-2.5">
          <Text className="text-zinc-300 font-bold text-sm uppercase tracking-wider">
            Financial Overview (Monthly)
          </Text>
          <Pressable onPress={() => router.push("/accounting" as any)}>
            <Text className="text-emerald-400 text-xs font-semibold">Accounting Hub →</Text>
          </Pressable>
        </View>

        {isLoadingReport ? (
          <View className="grid grid-cols-2 gap-3 mb-2">
            <Skeleton height={85} borderRadius={16} />
            <Skeleton height={85} borderRadius={16} />
            <Skeleton height={85} borderRadius={16} />
            <Skeleton height={85} borderRadius={16} />
          </View>
        ) : (
          <View className="grid grid-cols-2 gap-2.5">
            <Card className="bg-zinc-900 border-zinc-800 p-3.5">
              <Text className="text-zinc-400 text-xs font-medium">Net Profit</Text>
              <Text className="text-emerald-400 text-xl font-black mt-1">
                {formatFin(report?.netProfit)}
              </Text>
              <Text className="text-zinc-500 text-[10px] mt-0.5">Current Month</Text>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 p-3.5">
              <Text className="text-zinc-400 text-xs font-medium">Total Revenue</Text>
              <Text className="text-blue-400 text-xl font-black mt-1">
                {formatFin(report?.totalRevenue)}
              </Text>
              <Text className="text-zinc-500 text-[10px] mt-0.5">Booking & Sales</Text>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 p-3.5">
              <Text className="text-zinc-400 text-xs font-medium">Cash on Hand</Text>
              <Text className="text-amber-400 text-xl font-black mt-1">
                {formatFin(report?.totalCash)}
              </Text>
              <Text className="text-zinc-500 text-[10px] mt-0.5">All Accounts</Text>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 p-3.5">
              <Text className="text-zinc-400 text-xs font-medium">Receivables</Text>
              <Text className="text-purple-400 text-xl font-black mt-1">
                {formatFin(report?.totalReceivables)}
              </Text>
              <Text className="text-zinc-500 text-[10px] mt-0.5">Unpaid Bookings</Text>
            </Card>
          </View>
        )}
      </View>

      {/* Operational Stats */}
      <View className="flex-row gap-3">
        <Card className="flex-1 bg-zinc-950/80 border-zinc-800/80 p-3">
          <Text className="text-zinc-500 text-[10px] uppercase font-bold">Turfs</Text>
          <Text className="text-white text-lg font-black mt-0.5">
            {turfs.length} Grounds
          </Text>
        </Card>

        <Card className="flex-1 bg-zinc-950/80 border-zinc-800/80 p-3">
          <Text className="text-zinc-500 text-[10px] uppercase font-bold">Bookings</Text>
          <Text className="text-white text-lg font-black mt-0.5">
            {report?.bookingCount ?? bookings.length} Total
          </Text>
        </Card>

        <Pressable
          onPress={() => router.push("/partners" as any)}
          className="flex-1 active:opacity-80"
        >
          <Card className="bg-zinc-950/80 border-zinc-800/80 p-3">
            <Text className="text-zinc-500 text-[10px] uppercase font-bold">Partners</Text>
            <Text className="text-purple-400 text-lg font-black mt-0.5">
              {report?.partnerCount ?? 1} Active →
            </Text>
          </Card>
        </Pressable>
      </View>

      {/* Quick Admin Actions */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-zinc-300 font-bold text-sm uppercase tracking-wider mb-3">
          Quick Management Actions
        </Text>
        <View className="space-y-2">
          <View className="flex-row gap-2.5">
            <Button
              title="+ Booking"
              variant="primary"
              size="sm"
              onPress={() => router.push("/booking/create" as any)}
              className="flex-1"
            />
            <Button
              title="+ Add Pitch"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/turf/manage" as any)}
              className="flex-1"
            />
          </View>
          <View className="flex-row gap-2.5">
            <Button
              title="💳 Payments"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/payments" as any)}
              className="flex-1"
            />
            <Button
              title="👥 Customers"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/customers" as any)}
              className="flex-1"
            />
          </View>
          <View className="flex-row gap-2.5">
            <Button
              title="📊 Accounting"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/accounting" as any)}
              className="flex-1"
            />
            <Button
              title="🤝 Partners"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/partners" as any)}
              className="flex-1"
            />
          </View>
          <View className="flex-row gap-2.5">
            <Button
              title="🛍️ Retail POS"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/pos" as any)}
              className="flex-1"
            />
            <Button
              title="🏆 Tournaments"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/(tabs)/tournaments" as any)}
              className="flex-1"
            />
          </View>
          <Button
            title="👥 Team & User Access Control"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/users" as any)}
            className="w-full"
          />
        </View>
      </Card>

      {/* Recent Bookings Activity Feed */}
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white font-bold text-lg">
            Live Reservation Feed
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/bookings")}>
            <Text className="text-emerald-400 text-xs font-semibold">
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
