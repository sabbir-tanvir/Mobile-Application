import React from "react";
import { View, Text, Pressable, FlatList, Linking, Platform, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper, Card, Badge, Button, Skeleton } from "@/components/ui";
import { useCustomerByPhone } from "@/hooks/queries/useCustomers";
import { formatTaka } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export default function CustomerDetailScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();

  const { customer, isLoading } = useCustomerByPhone(phone);

  const handleCall = () => {
    if (!customer?.phone) return;
    const url = `tel:${customer.phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          if (Platform.OS === "web") {
            window.alert(`Call ${customer.phone}`);
          } else {
            Alert.alert("Call Player", `Dial: ${customer.phone}`);
          }
        }
      })
      .catch(() => {
        Alert.alert("Error", `Cannot open phone dialer`);
      });
  };

  const handleSMS = () => {
    if (!customer?.phone) return;
    const url = `sms:${customer.phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("SMS Player", `SMS: ${customer.phone}`);
        }
      })
      .catch(() => {
        Alert.alert("Error", `Cannot open messaging`);
      });
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View className="py-6 space-y-4">
          <Skeleton height={40} width={120} borderRadius={12} />
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={80} borderRadius={16} />
          <Skeleton height={200} borderRadius={16} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!customer) {
    return (
      <ScreenWrapper>
        <View className="items-center justify-center py-16">
          <Text className="text-4xl mb-3">🔍</Text>
          <Text className="text-white font-bold text-lg">Customer Not Found</Text>
          <Text className="text-zinc-500 text-xs mt-1 text-center">
            No booking records found for phone: {phone}
          </Text>
          <Button
            title="← Back to Directory"
            variant="secondary"
            onPress={() => router.back()}
            className="mt-5"
          />
        </View>
      </ScreenWrapper>
    );
  }

  const initial = customer.name ? customer.name[0].toUpperCase() : "?";

  return (
    <ScreenWrapper className="pb-6">
      {/* Top Header */}
      <View className="flex-row items-center justify-between my-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center active:bg-zinc-800"
        >
          <Text className="text-white text-base font-bold">←</Text>
        </Pressable>
        <Text className="text-white text-base font-black">Player Profile</Text>
        <View className="w-10" />
      </View>

      {/* Customer Header Card */}
      <Card className="bg-zinc-900 border-zinc-800 p-4 mb-3.5">
        <View className="flex-row items-center gap-3.5">
          <View className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 items-center justify-center shadow-lg shadow-emerald-950">
            <Text className="text-emerald-400 font-black text-2xl">{initial}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-black text-lg" numberOfLines={1}>
                {customer.name}
              </Text>
              <Badge
                label={customer.tier}
                variant={
                  customer.tier === "VIP"
                    ? "warning"
                    : customer.tier === "Regular"
                    ? "info"
                    : "default"
                }
                size="sm"
              />
            </View>
            <Text className="text-zinc-400 text-xs font-mono mt-0.5">{customer.phone}</Text>
            {customer.email && (
              <Text className="text-zinc-500 text-[11px] mt-0.5">{customer.email}</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2 mt-4 pt-3 border-t border-zinc-800">
          <Pressable
            onPress={handleCall}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 active:bg-emerald-700 flex-row items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
          >
            <Text className="text-white font-bold text-xs">📞 Call Player</Text>
          </Pressable>
          <Pressable
            onPress={handleSMS}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 active:bg-zinc-700 border border-zinc-700 flex-row items-center justify-center gap-1.5"
          >
            <Text className="text-zinc-200 font-bold text-xs">💬 Send SMS</Text>
          </Pressable>
        </View>
      </Card>

      {/* Lifetime Value Metric Cards */}
      <View className="flex-row gap-2.5 mb-4">
        <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3">
          <Text className="text-zinc-500 text-[10px] font-bold uppercase">Total Matches</Text>
          <Text className="text-white font-black text-lg mt-1">{customer.bookingsCount}</Text>
          <Text className="text-zinc-500 text-[10px] mt-0.5">Reservations</Text>
        </Card>

        <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3">
          <Text className="text-zinc-500 text-[10px] font-bold uppercase">Lifetime Spend</Text>
          <Text className="text-emerald-400 font-black text-base mt-1" numberOfLines={1}>
            {formatTaka(customer.totalSpent)}
          </Text>
          <Text className="text-zinc-500 text-[10px] mt-0.5">Collected</Text>
        </Card>

        <Card className="flex-1 bg-zinc-900 border-zinc-800 p-3">
          <Text className="text-zinc-500 text-[10px] font-bold uppercase">Pending Dues</Text>
          <Text
            className={`font-black text-base mt-1 ${
              customer.unpaidDues > 0 ? "text-amber-400" : "text-zinc-400"
            }`}
            numberOfLines={1}
          >
            {formatTaka(customer.unpaidDues)}
          </Text>
          <Text className="text-zinc-500 text-[10px] mt-0.5">Outstanding</Text>
        </Card>
      </View>

      {/* Booking History Header */}
      <View className="flex-row items-center justify-between mb-2.5">
        <Text className="text-white font-bold text-base">Match History</Text>
        <Text className="text-zinc-500 text-xs">{customer.bookings.length} reservations</Text>
      </View>

      {/* Chronological Reservations List */}
      <FlatList
        data={customer.bookings}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/booking/${item.id}` as any)}
            className="mb-2.5 active:opacity-90"
          >
            <Card className="bg-zinc-900/90 border-zinc-800 p-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-white font-bold text-sm">
                    {formatDate(item.date)}
                  </Text>
                  <Text className="text-zinc-400 text-xs font-mono">
                    {item.startHour}:00 - {item.endHour}:00
                  </Text>
                </View>
                <Badge
                  label={item.status}
                  variant={
                    item.status === "confirmed"
                      ? "success"
                      : item.status === "completed"
                      ? "info"
                      : item.status === "cancelled"
                      ? "danger"
                      : "warning"
                  }
                  size="sm"
                />
              </View>

              <View className="flex-row items-center justify-between border-t border-zinc-800/80 pt-2">
                <View>
                  <Text className="text-zinc-400 text-xs">
                    {item.turfName || `Pitch #${item.turfId}`} • {item.durationHours || item.endHour - item.startHour}h
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="text-emerald-400 font-bold text-xs">
                    {formatTaka(item.totalPrice)}
                  </Text>
                  <Badge
                    label={item.paymentStatus}
                    variant={
                      item.paymentStatus === "paid"
                        ? "success"
                        : item.paymentStatus === "partial"
                        ? "warning"
                        : "danger"
                    }
                    size="sm"
                  />
                  <Text className="text-zinc-500 text-sm font-bold">›</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </ScreenWrapper>
  );
}
