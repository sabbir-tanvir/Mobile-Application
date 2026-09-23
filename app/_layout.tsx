import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/queryClient";
import { useAuthStore, selectIsAuth, selectAuthLoading } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { View, ActivityIndicator } from "react-native";
import "../src/theme/global.css";

function RootNavigationLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore(selectIsAuth);
  const isLoading = useAuthStore(selectAuthLoading);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeAuth();
    initializeTheme();
  }, [initializeAuth, initializeTheme]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigationLayout />
    </QueryClientProvider>
  );
}
