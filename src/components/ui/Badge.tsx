import React from "react";
import { View, Text } from "react-native";

export type BadgeVariant = "pending" | "partial" | "paid" | "cancelled" | "default" | "success" | "warning";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  size = "md",
}) => {
  const getBadgeStyles = () => {
    switch (variant) {
      case "paid":
      case "success":
        return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
      case "partial":
        return "bg-blue-500/15 border-blue-500/30 text-blue-400";
      case "pending":
      case "warning":
        return "bg-amber-500/15 border-amber-500/30 text-amber-400";
      case "cancelled":
        return "bg-red-500/15 border-red-500/30 text-red-400";
      case "default":
      default:
        return "bg-zinc-800 border-zinc-700 text-zinc-300";
    }
  };

  const getBadgeTextStyles = () => {
    switch (variant) {
      case "paid":
      case "success":
        return "text-emerald-400";
      case "partial":
        return "text-blue-400";
      case "pending":
      case "warning":
        return "text-amber-400";
      case "cancelled":
        return "text-red-400";
      case "default":
      default:
        return "text-zinc-300";
    }
  };

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <View
      className={`flex-row items-center border rounded-full self-start ${sizeClass} ${getBadgeStyles()}`}
    >
      <Text className={`font-semibold capitalize ${getBadgeTextStyles()}`}>
        {label}
      </Text>
    </View>
  );
};
