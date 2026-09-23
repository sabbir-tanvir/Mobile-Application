import React from "react";
import { View, Text } from "react-native";

export type BadgeVariant =
  | "pending"
  | "partial"
  | "paid"
  | "cancelled"
  | "default"
  | "success"
  | "warning"
  | "info"
  | "danger";

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
        return "bg-emerald-100 border-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-500/30";
      case "partial":
      case "info":
        return "bg-blue-100 border-blue-300 dark:bg-blue-500/15 dark:border-blue-500/30";
      case "pending":
      case "warning":
        return "bg-amber-100 border-amber-300 dark:bg-amber-500/15 dark:border-amber-500/30";
      case "cancelled":
      case "danger":
        return "bg-red-100 border-red-300 dark:bg-red-500/15 dark:border-red-500/30";
      case "default":
      default:
        return "bg-slate-100 border-slate-300 dark:bg-zinc-800 dark:border-zinc-700";
    }
  };

  const getBadgeTextStyles = () => {
    switch (variant) {
      case "paid":
      case "success":
        return "text-emerald-700 dark:text-emerald-400";
      case "partial":
      case "info":
        return "text-blue-700 dark:text-blue-400";
      case "pending":
      case "warning":
        return "text-amber-700 dark:text-amber-400";
      case "cancelled":
      case "danger":
        return "text-red-700 dark:text-red-400";
      case "default":
      default:
        return "text-slate-700 dark:text-zinc-300";
    }
  };

  const sizeStyles =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-xs";

  return (
    <View
      className={`border rounded-full flex-row items-center self-start ${getBadgeStyles()} ${sizeStyles}`}
    >
      <Text className={`font-bold capitalize ${getBadgeTextStyles()}`}>
        {label}
      </Text>
    </View>
  );
};
