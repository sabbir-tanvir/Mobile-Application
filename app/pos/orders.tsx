import React, { useState } from "react";
import { View, Text, Pressable, FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Skeleton } from "@/components/ui";
import { useOrders, useUpdateOrderStatus } from "@/hooks/queries/useOrders";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { OrderItem, OrderLineItem } from "@/api/types/product.types";

const STATUS_FILTERS = ["all", "confirmed", "delivered", "pending", "cancelled"];

export default function OrdersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: orders = [], isLoading, isRefetching, refetch } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchQuery ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone?.includes(searchQuery) ||
      o.id?.includes(searchQuery);

    const matchesStatus =
      selectedStatus === "all" || o.status?.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const parseItems = (items: OrderLineItem[] | string): OrderLineItem[] => {
    if (Array.isArray(items)) return items;
    if (typeof items === "string") {
      try {
        return JSON.parse(items);
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleMarkDelivered = (orderId: string) => {
    updateStatusMutation.mutate({ id: orderId, payload: { status: "delivered" } });
  };

  return (
    <ScreenWrapper className="pb-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 items-center justify-center shadow-sm shadow-slate-200/50 dark:shadow-none active:scale-95"
          >
            <Text className="text-slate-800 dark:text-white text-base font-bold">←</Text>
          </Pressable>
          <View>
            <Text className="text-slate-900 dark:text-white text-xl font-black tracking-tight">Retail Orders</Text>
            <Text className="text-slate-500 dark:text-zinc-400 text-xs">{orders.length} transactions recorded</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/pos" as any)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 border border-emerald-500 shadow-sm shadow-emerald-600/30 flex-row items-center"
        >
          <Text className="text-white font-bold text-xs">+ New Sale</Text>
        </Pressable>
      </View>

      {/* Summary KPI Card */}
      <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 mb-3.5 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none flex-row items-center justify-between">
        <View>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
            Total Retail Revenue
          </Text>
          <Text className="text-emerald-600 dark:text-emerald-400 font-black text-xl mt-1">
            {formatTaka(totalRevenue)}
          </Text>
          <Text className="text-slate-400 dark:text-zinc-500 text-[10px] mt-0.5">{orders.length} total orders</Text>
        </View>
        <View className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 items-center justify-center shadow-xs">
          <Text className="text-xl">🛍️</Text>
        </View>
      </Card>

      {/* Search Input */}
      <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 mb-3 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <Text className="text-slate-400 dark:text-zinc-500 mr-2 text-sm">🔍</Text>
        <TextInput
          placeholder="Search customer, phone or order ID..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-slate-900 dark:text-white text-xs"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-slate-400 dark:text-zinc-400 text-xs px-1">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Status Filter Chips */}
      <View className="flex-row flex-wrap gap-1.5 mb-3.5">
        {STATUS_FILTERS.map((s) => {
          const isSelected = selectedStatus === s;
          return (
            <Pressable
              key={s}
              onPress={() => setSelectedStatus(s)}
              className={`px-3.5 py-1.5 rounded-full border capitalize ${
                isSelected
                  ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30"
                  : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? "text-white" : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                {s}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Orders List */}
      {isLoading ? (
        <View className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={90} borderRadius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card className="bg-white/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-8 items-center justify-center my-6 rounded-2xl">
              <Text className="text-3xl mb-2">📋</Text>
              <Text className="text-slate-800 dark:text-zinc-300 font-bold text-sm">No orders found</Text>
              <Text className="text-slate-500 dark:text-zinc-500 text-xs text-center mt-1">
                Completed sales at the POS terminal will appear here
              </Text>
            </Card>
          }
          renderItem={({ item }) => {
            const parsedItems = parseItems(item.items);
            const isConfirmed = item.status === "confirmed";

            return (
              <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 mb-2.5 rounded-2xl shadow-sm shadow-slate-200/50 dark:shadow-none">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-slate-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                        {item.customerName || "Walk-in Customer"}
                      </Text>
                      <Badge
                        label={item.status}
                        variant={
                          item.status === "delivered"
                            ? "success"
                            : item.status === "cancelled"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      />
                    </View>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className="text-slate-500 dark:text-zinc-400 text-xs">
                        {item.createdAt ? formatDate(item.createdAt) : "—"}
                      </Text>
                      {item.customerPhone ? (
                        <>
                          <Text className="text-slate-300 dark:text-zinc-600">•</Text>
                          <Text className="text-slate-500 dark:text-zinc-400 text-xs font-mono">
                            {item.customerPhone}
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-emerald-600 dark:text-emerald-400 font-black text-base">
                      {formatTaka(item.totalAmount)}
                    </Text>
                    <Badge label={item.paymentMethod} variant="default" size="sm" />
                  </View>
                </View>

                {/* Itemized Line Items */}
                {parsedItems.length > 0 && (
                  <View className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    {parsedItems.map((prod, idx) => (
                      <View key={idx} className="flex-row justify-between py-0.5">
                        <Text className="text-slate-700 dark:text-zinc-300 text-xs flex-1 mr-2" numberOfLines={1}>
                          {prod.quantity}x {prod.productName}
                        </Text>
                        <Text className="text-slate-500 dark:text-zinc-400 text-xs font-mono">
                          {formatTaka(prod.subtotal)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Delivery Action Button */}
                {isConfirmed && (
                  <View className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex-row justify-end">
                    <Pressable
                      onPress={() => handleMarkDelivered(item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 active:bg-emerald-700 shadow-sm shadow-emerald-600/30"
                    >
                      <Text className="text-white font-bold text-xs">✓ Mark Delivered</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
            );
          }}
        />
      )}
    </ScreenWrapper>
  );
}
