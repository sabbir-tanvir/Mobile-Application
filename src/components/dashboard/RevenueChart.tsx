import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui';
import type { Booking } from '@/api/types/booking.types';

export const RevenueChart = ({ bookings = [] }: { bookings?: Booking[] }) => {
  const last7Days: any[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    const dayBookings = bookings.filter((b) => {
      const pRaw = b.createdAt || b.date || "";
      const pDateStr = pRaw ? new Date(pRaw).toISOString().slice(0, 10) : "";
      return pDateStr === dateStr && (b.paymentStatus === "paid" || b.paymentStatus === "partial");
    });
    
    // In poisha, converting to Taka
    const total = dayBookings.reduce((s, p) => s + Math.round((Number(p.paidAmount || p.totalPrice || 0)) / 100), 0);
    
    last7Days.push({
      value: total,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      dataPointText: total > 0 ? `৳${total}` : '',
    });
  }

  // Calculate max value for Y-axis dynamic scaling
  const maxValue = Math.max(...last7Days.map(item => item.value));
  const maxValueRounded = Math.ceil((maxValue || 1000) / 1000) * 1000;
  const screenWidth = Dimensions.get('window').width;

  return (
    <Card className="p-4 mb-5 shadow-sm border-0 bg-white dark:bg-zinc-900">
      <Text className="text-slate-800 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider mb-4">
        Revenue (Last 7 Days)
      </Text>
      <View className="overflow-hidden">
        <LineChart
          data={last7Days}
          height={180}
          initialSpacing={10}
          spacing={(screenWidth - 100) / 6}
          hideDataPoints={false}
          thickness={3}
          color="#10b981"
          yAxisColor="#e2e8f0"
          xAxisColor="#e2e8f0"
          yAxisTextStyle={{ color: "#94a3b8", fontSize: 10 }}
          xAxisLabelTextStyle={{ color: "#94a3b8", fontSize: 10, textAlign: "center" }}
          yAxisTextNumberOfLines={1}
          maxValue={maxValueRounded}
          noOfSections={4}
          formatYLabel={(label: string) => `৳${Math.round(Number(label))}`}
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: 'lightgray',
            pointerStripWidth: 2,
            pointerColor: '#10b981',
            radius: 6,
            pointerLabelWidth: 60,
            pointerLabelHeight: 30,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: any) => {
              return (
                <View className="bg-slate-800 rounded-lg px-2 py-1 items-center justify-center -ml-3">
                  <Text className="text-white text-[10px] font-bold">
                    ৳{items[0].value}
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>
    </Card>
  );
};
