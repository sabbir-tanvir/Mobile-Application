import React from "react";
import {
  TextInput,
  View,
  Text,
  TextInputProps,
} from "react-native";
import { useThemeStore } from "@/stores/theme.store";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconRight,
  containerClassName = "",
  placeholderTextColor,
  ...props
}) => {
  const isDark = useThemeStore((s) => s.isDark);
  const resolvedPlaceholder =
    placeholderTextColor || (isDark ? "#71717a" : "#94a3b8");

  return (
    <View className={`w-full mb-3.5 ${containerClassName}`}>
      {label && (
        <Text className="text-slate-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-0.5">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-slate-100 dark:bg-zinc-900 border rounded-2xl px-3.5 py-3 ${
          error
            ? "border-red-500"
            : "border-slate-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500"
        }`}
      >
        {icon && <View className="mr-2.5 text-slate-400 dark:text-zinc-400">{icon}</View>}
        <TextInput
          placeholderTextColor={resolvedPlaceholder}
          className="flex-1 text-slate-900 dark:text-white text-sm font-medium p-0"
          {...props}
        />
        {iconRight && <View className="ml-2.5">{iconRight}</View>}
      </View>
      {error && (
        <Text className="text-red-500 dark:text-red-400 text-xs font-medium mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
