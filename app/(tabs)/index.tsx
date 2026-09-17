import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Badge } from "@/components/ui";
import {
  AdminDashboardView,
  PartnerDashboardView,
  StaffDashboardView,
  CustomerDashboardView,
} from "@/components/dashboard";
import { useTurfs } from "@/hooks/queries/useTurfs";
import { useBookings } from "@/hooks/queries/useBookings";
import { useTournaments } from "@/hooks/queries/useTournaments";
import { useDashboardReport } from "@/hooks/queries/useReports";
import { useAuthStore, selectUser } from "@/stores/auth.store";

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const role = user?.role || "customer";

  const isFinancialRole = role === "admin" || role === "partner";

  const {
    data: report,
    isLoading: reportLoading,
    refetch: refetchReport,
    isRefetching: reportRefetching,
  } = useDashboardReport(undefined, isFinancialRole);

  const {
    data: turfs = [],
    isLoading: turfsLoading,
    refetch: refetchTurfs,
    isRefetching: turfsRefetching,
  } = useTurfs();

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    refetch: refetchBookings,
    isRefetching: bookingsRefetching,
  } = useBookings({ limit: 10 });

  const {
    data: tournaments = [],
    isLoading: tournamentsLoading,
    refetch: refetchTournaments,
  } = useTournaments({ limit: 3 });

  const isRefreshing =
    turfsRefetching || bookingsRefetching || reportRefetching;

  const onRefresh = () => {
    refetchTurfs();
    refetchBookings();
    refetchTournaments();
    if (isFinancialRole) {
      refetchReport();
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return { label: "👑 Admin", variant: "paid" as const };
      case "partner":
        return { label: "💼 Partner", variant: "partial" as const };
      case "staff":
        return { label: "🛠️ Staff", variant: "warning" as const };
      case "customer":
      case "user":
      default:
        return { label: "⚽ Player", variant: "default" as const };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <ScreenWrapper
      scrollable
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      className="pb-8"
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              TurfSlot
            </Text>
            <Badge label={roleBadge.label} variant={roleBadge.variant} size="sm" />
          </View>
          <Text className="text-white text-2xl font-black" numberOfLines={1}>
            {user?.fullName || user?.name || "Player"} 👋
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/profile")}
          className="w-11 h-11 rounded-full bg-zinc-900 border border-emerald-500/40 items-center justify-center"
        >
          <Text className="text-lg">
            {role === "admin"
              ? "👑"
              : role === "partner"
              ? "💼"
              : role === "staff"
              ? "🛠️"
              : "⚽"}
          </Text>
        </Pressable>
      </View>

      {/* Role-Specific Dashboard Renderer */}
      {role === "admin" ? (
        <AdminDashboardView
          report={report}
          isLoadingReport={reportLoading}
          bookings={bookings}
          turfs={turfs}
        />
      ) : role === "partner" ? (
        <PartnerDashboardView
          report={report}
          isLoadingReport={reportLoading}
          bookings={bookings}
        />
      ) : role === "staff" ? (
        <StaffDashboardView bookings={bookings} />
      ) : (
        <CustomerDashboardView
          turfs={turfs}
          turfsLoading={turfsLoading}
          bookings={bookings}
          tournaments={tournaments}
        />
      )}
    </ScreenWrapper>
  );
}
