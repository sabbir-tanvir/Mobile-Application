import React from "react";
import {
  TextInput,
  View,
  Text,
  TextInputProps,
} from "react-native";

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
  ...props
}) => {
  return (
    <View className={`w-full mb-3.5 ${containerClassName}`}>
      {label && (
        <Text className="text-zinc-300 text-xs font-medium uppercase tracking-wider mb-1.5 ml-0.5">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-zinc-900 border rounded-xl px-3.5 py-3 ${
          error ? "border-red-500" : "border-zinc-800 focus:border-emerald-500"
        }`}
      >
        {icon && <View className="mr-2.5 text-zinc-400">{icon}</View>}
        <TextInput
          placeholderTextColor="#71717a"
          className="flex-1 text-white text-base font-normal p-0"
          {...props}
        />
        {iconRight && <View className="ml-2.5">{iconRight}</View>}
      </View>
      {error && (
        <Text className="text-red-400 text-xs font-medium mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
