import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  View,
  GestureResponderEvent,
} from "react-native";
import { triggerHaptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  enableHaptics?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  iconRight,
  enableHaptics = true,
  onPress,
  className = "",
  textClassName = "",
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-emerald-600 active:bg-emerald-700 shadow-sm shadow-emerald-950/20";
      case "secondary":
        return "bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 active:bg-slate-200 dark:active:bg-zinc-700";
      case "outline":
        return "bg-transparent border border-emerald-600 dark:border-emerald-500 active:bg-emerald-50 dark:active:bg-emerald-950/30";
      case "danger":
        return "bg-red-600 active:bg-red-700 shadow-sm shadow-red-950/20";
      case "ghost":
        return "bg-transparent active:bg-slate-100 dark:active:bg-zinc-800/60";
      default:
        return "bg-emerald-600";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "py-2 px-3 rounded-xl";
      case "lg":
        return "py-4 px-6 rounded-2xl";
      case "md":
      default:
        return "py-3 px-4 rounded-xl";
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-lg";
      case "md":
      default:
        return "text-sm";
    }
  };

  const getTextVariantStyles = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return "text-white font-bold";
      case "secondary":
        return "text-slate-800 dark:text-zinc-100 font-semibold";
      case "outline":
        return "text-emerald-600 dark:text-emerald-400 font-bold";
      case "ghost":
        return "text-slate-600 dark:text-zinc-300 font-semibold";
    }
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (enableHaptics) {
      triggerHaptic();
    }
    if (onPress) {
      onPress(e);
    }
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={handlePress}
      className={cn(
        "flex-row items-center justify-center gap-2 active:scale-[0.98]",
        getVariantStyles(),
        getSizeStyles(),
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? "#10b981" : "#ffffff"}
        />
      ) : (
        <>
          {icon && <View className="mr-1">{icon}</View>}
          <Text
            className={cn(
              "text-center",
              getTextSizeStyles(),
              getTextVariantStyles(),
              textClassName
            )}
          >
            {title}
          </Text>
          {iconRight && <View className="ml-1">{iconRight}</View>}
        </>
      )}
    </Pressable>
  );
};
