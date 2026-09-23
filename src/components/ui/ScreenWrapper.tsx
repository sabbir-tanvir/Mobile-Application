import React from "react";
import {
  View,
  StatusBar,
  ScrollView,
  RefreshControl,
  ViewProps,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/stores/theme.store";

export interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  withKeyboardAvoid?: boolean;
  className?: string;
  edges?: ("top" | "right" | "bottom" | "left")[];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  refreshing = false,
  onRefresh,
  withKeyboardAvoid = true,
  className = "",
  edges = ["top", "left", "right"],
  ...props
}) => {
  const isDark = useThemeStore((s) => s.isDark);

  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
            colors={["#22c55e"]}
          />
        ) : undefined
      }
    >
      <View className={`flex-1 px-4 py-2 ${className}`} {...props}>
        {children}
      </View>
    </ScrollView>
  ) : (
    <View className={`flex-1 px-4 py-2 ${className}`} {...props}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-slate-50 dark:bg-zinc-950">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#09090b" : "#f8fafc"}
      />
      {withKeyboardAvoid ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};
