import React from "react";
import { View, Text, ScrollView } from "react-native";

export interface AmenityListProps {
  amenities: string[];
  maxDisplay?: number;
}

export const AmenityList: React.FC<AmenityListProps> = ({
  amenities = [],
  maxDisplay = 4,
}) => {
  if (!amenities || amenities.length === 0) return null;

  const displayList = amenities.slice(0, maxDisplay);
  const remaining = amenities.length - maxDisplay;

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-1.5 mt-2"
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {displayList.map((item, index) => (
          <View
            key={index}
            className="bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-lg px-2.5 py-1"
          >
            <Text className="text-slate-700 dark:text-zinc-300 text-xs font-medium">{item}</Text>
          </View>
        ))}
        {remaining > 0 && (
          <View className="bg-slate-100 dark:bg-zinc-800/40 rounded-lg px-2 py-1 flex-row items-center justify-center">
            <Text className="text-slate-500 dark:text-zinc-400 text-xs">+{remaining} more</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
