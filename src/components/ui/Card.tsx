import React from "react";
import { View, ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined" | "surface";
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
        return "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/60 shadow-md shadow-slate-300/40 dark:shadow-lg dark:shadow-black/60";
      case "outlined":
        return "bg-transparent border border-slate-200 dark:border-zinc-800";
      case "surface":
        return "bg-slate-100/90 dark:bg-zinc-950/80 border border-slate-200/60 dark:border-zinc-800/60";
      case "default":
      default:
        return "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm shadow-slate-200/60 dark:shadow-none";
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
