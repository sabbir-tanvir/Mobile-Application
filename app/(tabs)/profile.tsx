import React, { useState } from "react";
import { View, Text, Alert, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button } from "@/components/ui";
import { useAuthStore, selectUser } from "@/stores/auth.store";
import { queryClient } from "@/config/queryClient";
import { env } from "@/config/env";
import { resolveApiBaseUrl } from "@/api/client";

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "Executive P&L & Monthly Net Profit analytics",
    "Real-time cash on hand & accounts receivable",
    "Venue grounds management & operating hours",
    "Full reservation creation, updates & cancellations",
    "Staff, partner & customer user management",
  ],
  partner: [
    "Personal profit share ratio & dividend tracking",
    "Gross dividends earned & outstanding payouts",
    "High-level venue revenue & profitability trends",
    "Venue booking activity stream",
  ],
  staff: [
    "Today's shift match schedule & field check-in",
    "Player attendance confirmation & slot management",
    "Instant walk-in reservations",
    "Collecting cash, bKash, Nagad & card payments",
  ],
  customer: [
    "Explore sports grounds & check live hourly rates",
    "Reserve slots with advance or partial payment",
    "Track active bookings & remaining due balances",
    "Community tournaments & championship registrations",
  ],
};

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((state) => state.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = (user?.role || "customer").toLowerCase();
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.customer;

  const performLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      queryClient.clear();
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        const confirmed = window.confirm("Are you sure you want to sign out of TurfSlot?");
        if (confirmed) {
          performLogout();
        }
      } else {
        performLogout();
      }
      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out of TurfSlot?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: performLogout,
      },
    ]);
  };

  const getRoleBadgeInfo = () => {
    switch (role) {
      case "admin":
        return { icon: "👑", label: "ADMINISTRATOR", variant: "paid" as const };
      case "partner":
        return { icon: "💼", label: "PARTNER / INVESTOR", variant: "partial" as const };
      case "staff":
        return { icon: "🛠️", label: "FIELD STAFF", variant: "warning" as const };
      default:
        return { icon: "⚽", label: "CUSTOMER / PLAYER", variant: "default" as const };
    }
  };

  const badgeInfo = getRoleBadgeInfo();

  return (
    <ScreenWrapper scrollable className="pb-8">
      {/* User Header Profile Card */}
      <View className="items-center my-5">
        <View className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 items-center justify-center mb-2 shadow-md shadow-emerald-950">
          <Text className="text-4xl">{badgeInfo.icon}</Text>
        </View>
        <Text className="text-white text-xl font-bold">
          {user?.fullName || user?.name || "TurfSlot User"}
        </Text>
        <Text className="text-zinc-400 text-xs mt-0.5">
          {user?.email || "—"}
        </Text>
        <View className="mt-2">
          <Badge
            label={badgeInfo.label}
            variant={badgeInfo.variant}
            size="sm"
          />
        </View>
      </View>

      {/* Account Info Section */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-3">
          Account Profile
        </Text>

        <View className="py-2.5 border-b border-zinc-800/80 flex-row justify-between">
          <Text className="text-zinc-400 text-sm">Full Name</Text>
          <Text className="text-white font-medium text-sm">
            {user?.fullName || user?.name || "—"}
          </Text>
        </View>

        <View className="py-2.5 border-b border-zinc-800/80 flex-row justify-between">
          <Text className="text-zinc-400 text-sm">Email Address</Text>
          <Text className="text-white font-medium text-sm">
            {user?.email || "—"}
          </Text>
        </View>

        <View className="py-2.5 flex-row justify-between">
          <Text className="text-zinc-400 text-sm">Assigned Role</Text>
          <Text className="text-emerald-400 font-semibold text-sm capitalize">
            {user?.role || "customer"}
          </Text>
        </View>
      </Card>

      {/* Role Capabilities & Scope */}
      <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2.5">
          Assigned Permissions & Scope
        </Text>
        <View className="space-y-2">
          {permissions.map((perm, idx) => (
            <View key={idx} className="flex-row items-center gap-2">
              <Text className="text-emerald-400 text-xs">✓</Text>
              <Text className="text-zinc-300 text-xs flex-1">{perm}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Management Hubs (Admin / Staff / Partner) */}
      {role !== "customer" && (
        <Card className="mb-4 bg-zinc-900 border-zinc-800 p-4">
          <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2.5">
            Management Hubs
          </Text>
          <View className="space-y-1">
            <Pressable
              onPress={() => router.push("/payments" as any)}
              className="py-2.5 border-b border-zinc-800/80 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2.5">
                <Text className="text-base">💳</Text>
                <View>
                  <Text className="text-white font-medium text-sm">Payments Hub</Text>
                  <Text className="text-zinc-500 text-xs">Collections, dues & digital receipts</Text>
                </View>
              </View>
              <Text className="text-zinc-500 text-sm">›</Text>
            </Pressable>

            {role === "admin" && (
              <Pressable
                onPress={() => router.push("/turf/manage" as any)}
                className="py-2.5 border-b border-zinc-800/80 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-base">🏟️</Text>
                  <View>
                    <Text className="text-white font-medium text-sm">Turf Ground Setup</Text>
                    <Text className="text-zinc-500 text-xs">Add pitches & configure hourly rates</Text>
                  </View>
                </View>
                <Text className="text-zinc-500 text-sm">›</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.push("/customers" as any)}
              className="py-2.5 border-b border-zinc-800/80 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2.5">
                <Text className="text-base">👥</Text>
                <View>
                  <Text className="text-white font-medium text-sm">Customer CRM</Text>
                  <Text className="text-zinc-500 text-xs">Player directory, lifetime spend & call</Text>
                </View>
              </View>
              <Text className="text-zinc-500 text-sm">›</Text>
            </Pressable>

            {role === "admin" && (
              <Pressable
                onPress={() => router.push("/accounting" as any)}
                className="py-2.5 border-b border-zinc-800/80 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-base">📊</Text>
                  <View>
                    <Text className="text-white font-medium text-sm">Financial Accounting</Text>
                    <Text className="text-zinc-500 text-xs">General ledger, accounts, expenses & incomes</Text>
                  </View>
                </View>
                <Text className="text-zinc-500 text-sm">›</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.push("/(tabs)/bookings")}
              className="py-2.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2.5">
                <Text className="text-base">⏱️</Text>
                <View>
                  <Text className="text-white font-medium text-sm">24h Slot Schedule</Text>
                  <Text className="text-zinc-500 text-xs">Live calendar matrix & bookings</Text>
                </View>
              </View>
              <Text className="text-zinc-500 text-sm">›</Text>
            </Pressable>
          </View>
        </Card>
      )}

      <Card className="mb-6 bg-zinc-900 border-zinc-800 p-4">
        <Text className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2.5">
          Server Connection
        </Text>

        <View className="py-1.5 border-b border-zinc-800/80 flex-row justify-between items-center">
          <Text className="text-zinc-400 text-xs">Active Endpoint</Text>
          <Text className="text-zinc-300 text-xs font-mono" numberOfLines={1}>
            {resolveApiBaseUrl()}
          </Text>
        </View>

        <View className="py-1.5 flex-row justify-between items-center">
          <Text className="text-zinc-400 text-xs">Environment</Text>
          <Text className="text-emerald-400 text-xs font-mono uppercase">
            {env.APP_ENV}
          </Text>
        </View>
      </Card>

      {/* Logout Button */}
      <Button
        title={loggingOut ? "Signing Out..." : "Sign Out"}
        variant="danger"
        loading={loggingOut}
        onPress={handleLogout}
        className="w-full"
      />
    </ScreenWrapper>
  );
}
