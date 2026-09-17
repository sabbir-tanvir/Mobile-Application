import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  View,
} from "react-native";

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  iconRight,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-emerald-600 active:bg-emerald-700 text-white";
      case "secondary":
        return "bg-zinc-800 active:bg-zinc-700 text-white border border-zinc-700";
      case "outline":
        return "bg-transparent border border-emerald-500 text-emerald-400 active:bg-emerald-950/30";
      case "danger":
        return "bg-red-600 active:bg-red-700 text-white";
      case "ghost":
        return "bg-transparent text-zinc-300 active:bg-zinc-800/50";
      default:
        return "bg-emerald-600 text-white";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "py-2 px-3 text-xs rounded-lg";
      case "lg":
        return "py-4 px-6 text-lg rounded-2xl";
      case "md":
      default:
        return "py-3.5 px-5 text-base rounded-xl";
    }
  };

  const getTextVariantStyles = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return "text-white font-semibold";
      case "secondary":
        return "text-zinc-100 font-semibold";
      case "outline":
        return "text-emerald-400 font-semibold";
      case "ghost":
        return "text-zinc-300 font-medium";
    }
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 ${getVariantStyles()} ${getSizeStyles()} ${
        isDisabled ? "opacity-50" : ""
      }`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? "#34d399" : "#ffffff"}
        />
      ) : (
        <>
          {icon && <View className="mr-1">{icon}</View>}
          <Text className={`text-center ${getTextVariantStyles()}`}>
            {title}
          </Text>
          {iconRight && <View className="ml-1">{iconRight}</View>}
        </>
      )}
    </Pressable>
  );
};
