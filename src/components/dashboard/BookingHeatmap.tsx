import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from '@/components/ui';
import type { Booking } from '@/api/types/booking.types';

const hours = Array.from({ length: 12 }, (_, i) => 6 + (i * 1.5));

const formatTime = (timeNum: number) => {
  const h = Math.floor(timeNum);
  const m = Math.round((timeNum - h) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m === 0 ? '00' : m} ${ampm}`;
};

export const BookingHeatmap = ({ bookings = [] }: { bookings?: Booking[] }) => {
  // Show past 7 days up to today
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d;
  });

  const grid: Record<string, number> = {};
  weekDays.forEach((d, di) => {
    hours.forEach((h) => {
      grid[`${di}-${h}`] = 0;
    });
  });

  bookings.forEach((b) => {
    if (!b.date || b.paymentStatus === "cancelled" || b.status === "cancelled") return;
    const bDate = b.date;
    const dayIdx = weekDays.findIndex((d) => d.toISOString().split("T")[0] === bDate);
    if (dayIdx === -1) return; // Ignore bookings outside current week range

    const startH = Number(b.startHour);
    const endH = Number(b.endHour);

    hours.forEach((h) => {
      const slotEnd = h + 1.5;
      if (startH < slotEnd && endH > h) {
        const key = `${dayIdx}-${h}`;
        if (grid[key] !== undefined) grid[key]++;
      }
    });
  });

  const maxVal = Math.max(1, ...Object.values(grid));

  const getColor = (val: number) => {
    if (val === 0) return "bg-slate-100 dark:bg-zinc-800";
    const ratio = val / maxVal;
    if (ratio < 0.25) return "bg-emerald-200/50 dark:bg-emerald-900/40";
    if (ratio < 0.5) return "bg-emerald-300 dark:bg-emerald-700/60";
    if (ratio < 0.75) return "bg-emerald-400 dark:bg-emerald-600";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  return (
    <Card className="p-4 mb-5 shadow-sm border-0 bg-white dark:bg-zinc-900">
      <Text className="text-slate-800 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider mb-4">
        Booking Density Heatmap
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
        <View className="flex-col">
          {/* Header Row (Hours) */}
          <View className="flex-row mb-1 ml-12">
            {hours.map((h) => (
              <View key={h} className="w-12 items-center justify-center">
                <Text className="text-[8px] text-slate-400 dark:text-zinc-500 text-center leading-tight">
                  {formatTime(h).replace(' ', '')}
                </Text>
                <Text className="text-[6px] text-slate-400 dark:text-zinc-500">-</Text>
                <Text className="text-[8px] text-slate-400 dark:text-zinc-500 text-center leading-tight">
                  {formatTime(h + 1.5).replace(' ', '')}
                </Text>
              </View>
            ))}
          </View>

          {/* Grid Rows (Days) */}
          {weekDays.map((d, di) => (
            <View key={di} className="flex-row items-center mb-1">
              <View className="w-12 items-end pr-2">
                <Text className="text-[10px] text-slate-600 dark:text-zinc-400 font-medium">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
              </View>
              {hours.map((h) => {
                const val = grid[`${di}-${h}`];
                return (
                  <View key={h} className="w-12 px-[2px]">
                    <View className={`h-6 rounded-sm ${getColor(val)}`} />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </Card>
  );
};
