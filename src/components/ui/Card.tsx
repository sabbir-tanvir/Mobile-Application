import React from "react";
import { View, ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined";
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  className = "",
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return "bg-zinc-900/95 border border-zinc-800 shadow-lg shadow-black/50";
      case "outlined":
        return "bg-transparent border border-zinc-800";
      case "default":
      default:
        return "bg-zinc-900 border border-zinc-800/80";
    }
  };

  return (
    <View
      className={`rounded-2xl p-4 ${getVariantStyles()} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
