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

export interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  withKeyboardAvoid?: boolean;
  className?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  refreshing = false,
  onRefresh,
  withKeyboardAvoid = true,
  className = "",
  ...props
}) => {
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
    <SafeAreaView className="flex-1 bg-zinc-950">
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />
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
