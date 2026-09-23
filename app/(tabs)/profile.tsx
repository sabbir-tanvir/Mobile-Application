import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { resolveApiBaseUrl } from "@/api/client";
import { env } from "@/config/env";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  const { theme, setTheme } = useThemeStore();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Logout Error", "Failed to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const role = user?.role || "customer";

  const getRolePermissions = () => {
    switch (role) {
      case "admin":
        return [
          "Full Venue Administration & Rate Configuration",
          "Financial Accounting & Journal Ledger Stream",
          "Partner Equity Reallocations & Payout Processing",
          "Team & User Access Control & Permissions",
          "Interactive 24h Slot Management & Override",
          "POS Inventory, Product Pricing & Retail Orders",
          "Tournament Organization & Bracket Control",
          "Executive P&L, Cash Position & Receivables Analytics",
        ];
      case "partner":
        return [
          "View Overall Turf Business Revenue & Profits",
          "Track Personal Basis Points Dividend Share",
          "Review Payout Records & Share Reallocation History",
          "Executive P&L Statements & Financial Analytics",
          "Monitor Live Venue Bookings & Ground Schedules",
        ];
      case "staff":
        return [
          "Create & Manage Daily Ground Bookings",
          "Check-in Players & Record Cash/Mobile Payments",
          "Operate Fast-Touch POS Register for Drinks & Gear",
          "View 24h Interactive Pitch Availability Matrix",
          "Inspect Player History & Contact Walk-ins",
        ];
      default:
        return [
          "Browse Available Football & Cricket Pitches",
          "Check Real-Time Slot Matrix & Hourly Rates",
          "Register Teams for Tournaments & Championships",
          "Review Match Booking History & Invoices",
        ];
    }
  };

  const permissions = getRolePermissions();

  const getRoleBadgeInfo = () => {
    switch (role) {
      case "admin":
        return { icon: "👑", label: "ADMINISTRATOR", variant: "info" as const };
      case "partner":
        return { icon: "🤝", label: "EQUITY PARTNER", variant: "warning" as const };
      case "staff":
        return { icon: "🛠️", label: "FIELD STAFF", variant: "success" as const };
      default:
        return { icon: "⚽", label: "CUSTOMER / PLAYER", variant: "default" as const };
    }
  };

  const badgeInfo = getRoleBadgeInfo();

  return (
    <ScreenWrapper scrollable className="pb-8">
      {/* User Header Profile Card */}
      <View className="items-center my-4">
        <View className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500 items-center justify-center mb-2 shadow-md shadow-emerald-500/20">
          <Text className="text-4xl">{badgeInfo.icon}</Text>
        </View>
        <Text className="text-slate-900 dark:text-white text-xl font-extrabold">
          {user?.fullName || user?.name || "TurfSlot User"}
        </Text>
        <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">
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

      {/* Theme & Display Mode Switcher */}
      <Card className="mb-4">
        <Text className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2.5">
          App Appearance
        </Text>
        <View className="flex-row gap-2 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          {[
            { id: "light", label: "Light", icon: "☀️" },
            { id: "dark", label: "Dark", icon: "🌙" },
            { id: "system", label: "System", icon: "📱" },
          ].map((item) => {
            const isSelected = theme === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setTheme(item.id as any)}
                className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 active:scale-[0.98] ${
                  isSelected
                    ? "bg-white dark:bg-zinc-800 shadow-sm border border-slate-200/80 dark:border-zinc-700"
                    : ""
                }`}
              >
                <Text className="text-sm">{item.icon}</Text>
                <Text
                  className={`text-xs font-bold ${
                    isSelected
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-zinc-400"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Account Info Section */}
      <Card className="mb-4">
        <Text className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider mb-3">
          Account Profile
        </Text>

        <View className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row justify-between items-center">
          <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Full Name</Text>
          <Text className="text-slate-900 dark:text-white font-bold text-sm">
            {user?.fullName || user?.name || "—"}
          </Text>
        </View>

        <View className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row justify-between items-center">
          <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Email Address</Text>
          <Text className="text-slate-900 dark:text-white font-bold text-sm">
            {user?.email || "—"}
          </Text>
        </View>

        <View className="py-2.5 flex-row justify-between items-center">
          <Text className="text-slate-500 dark:text-zinc-400 text-xs font-medium">Assigned Role</Text>
          <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-sm capitalize">
            {user?.role || "customer"}
          </Text>
        </View>
      </Card>

      {/* Role Capabilities & Scope */}
      <Card className="mb-4">
        <Text className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2.5">
          Assigned Permissions & Scope
        </Text>
        <View className="space-y-2">
          {permissions.map((perm, idx) => (
            <View key={idx} className="flex-row items-center gap-2">
              <Text className="text-emerald-500 font-bold text-xs">✓</Text>
              <Text className="text-slate-700 dark:text-zinc-300 text-xs flex-1">{perm}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Management Hubs (Admin / Staff / Partner) */}
      {role !== "customer" && (
        <Card className="mb-4">
          <Text className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2.5">
            Management Hubs
          </Text>
          <View className="space-y-1">
            <Pressable
              onPress={() => router.push("/payments" as any)}
              className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row items-center justify-between active:opacity-75"
            >
              <View className="flex-row items-center gap-2.5">
                <Text className="text-base">💳</Text>
                <View>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">Payments Hub</Text>
                  <Text className="text-slate-500 dark:text-zinc-400 text-xs">Collections, dues & digital receipts</Text>
                </View>
              </View>
              <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
            </Pressable>

            {role === "admin" && (
              <Pressable
                onPress={() => router.push("/turf/manage" as any)}
                className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row items-center justify-between active:opacity-75"
              >
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-base">🏟️</Text>
                  <View>
                    <Text className="text-slate-900 dark:text-white font-bold text-sm">Turf Ground Setup</Text>
                    <Text className="text-slate-500 dark:text-zinc-400 text-xs">Add pitches & configure hourly rates</Text>
                  </View>
                </View>
                <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.push("/customers" as any)}
              className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row items-center justify-between active:opacity-75"
            >
              <View className="flex-row items-center gap-2.5">
                <Text className="text-base">👥</Text>
                <View>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">Customer CRM</Text>
                  <Text className="text-slate-500 dark:text-zinc-400 text-xs">Player directory, lifetime spend & call</Text>
                </View>
              </View>
              <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
            </Pressable>

            {role === "admin" && (
              <Pressable
                onPress={() => router.push("/accounting" as any)}
                className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row items-center justify-between active:opacity-75"
              >
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-base">📊</Text>
                  <View>
                    <Text className="text-slate-900 dark:text-white font-bold text-sm">Financial Accounting</Text>
                    <Text className="text-slate-500 dark:text-zinc-400 text-xs">General ledger, accounts, expenses & incomes</Text>
                  </View>
                </View>
                <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
              </Pressable>
            )}

            {role === "admin" && (
              <Pressable
                onPress={() => router.push("/partners" as any)}
                className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row items-center justify-between active:opacity-75"
              >
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-base">🤝</Text>
                  <View>
                    <Text className="text-slate-900 dark:text-white font-bold text-sm">Partner Management</Text>
                    <Text className="text-slate-500 dark:text-zinc-400 text-xs">Equity shares, basis points & dividend payouts</Text>
                  </View>
                </View>
                <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
              </Pressable>
            )}

            {role === "admin" && (
              <Pressable
                onPress={() => router.push("/users" as any)}
                className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row items-center justify-between active:opacity-75"
              >
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-base">👥</Text>
                  <View>
                    <Text className="text-slate-900 dark:text-white font-bold text-sm">User Access & Roles</Text>
                    <Text className="text-slate-500 dark:text-zinc-400 text-xs">Manage staff, partners & system accounts</Text>
                  </View>
                </View>
                <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.push("/pos" as any)}
              className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row items-center justify-between active:opacity-75"
            >
              <View className="flex-row items-center gap-2.5">
                <Text className="text-base">🛍️</Text>
                <View>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">Retail POS & Inventory</Text>
                  <Text className="text-slate-500 dark:text-zinc-400 text-xs">Fast-checkout counter, drinks & gear stock</Text>
                </View>
              </View>
              <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/tournaments" as any)}
              className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row items-center justify-between active:opacity-75"
            >
              <View className="flex-row items-center gap-2.5">
                <Text className="text-base">🏆</Text>
                <View>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">Tournaments & Cups</Text>
                  <Text className="text-slate-500 dark:text-zinc-400 text-xs">Championships, registered teams & brackets</Text>
                </View>
              </View>
              <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
            </Pressable>

            {(role === "admin" || role === "partner") && (
              <Pressable
                onPress={() => router.push("/reports" as any)}
                className="py-2.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row items-center justify-between active:opacity-75"
              >
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-base">📊</Text>
                  <View>
                    <Text className="text-slate-900 dark:text-white font-bold text-sm">Financial Reports & P&L</Text>
                    <Text className="text-slate-500 dark:text-zinc-400 text-xs">Statements, liquidity & receivables</Text>
                  </View>
                </View>
                <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => router.push("/(tabs)/bookings")}
              className="py-2.5 flex-row items-center justify-between active:opacity-75"
            >
              <View className="flex-row items-center gap-2.5">
                <Text className="text-base">⏱️</Text>
                <View>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">24h Slot Schedule</Text>
                  <Text className="text-slate-500 dark:text-zinc-400 text-xs">Live calendar matrix & bookings</Text>
                </View>
              </View>
              <Text className="text-slate-400 dark:text-zinc-500 text-sm font-bold">›</Text>
            </Pressable>
          </View>
        </Card>
      )}

      {/* Server Info */}
      <Card className="mb-6">
        <Text className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2.5">
          Server Connection
        </Text>

        <View className="py-1.5 border-b border-slate-100 dark:border-zinc-800/80 flex-row justify-between items-center">
          <Text className="text-slate-500 dark:text-zinc-400 text-xs">Active Endpoint</Text>
          <Text className="text-slate-800 dark:text-zinc-300 text-xs font-mono" numberOfLines={1}>
            {resolveApiBaseUrl()}
          </Text>
        </View>

        <View className="py-1.5 flex-row justify-between items-center">
          <Text className="text-slate-500 dark:text-zinc-400 text-xs">Environment</Text>
          <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-mono uppercase font-bold">
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
