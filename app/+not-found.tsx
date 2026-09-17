import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Button } from "@/components/ui";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper className="items-center justify-center p-6">
      <Text className="text-6xl mb-4">🏟️</Text>
      <Text className="text-white text-2xl font-black mb-2">Page Not Found</Text>
      <Text className="text-zinc-400 text-sm text-center mb-6">
        This screen doesn't exist or has been moved.
      </Text>
      <Button title="Go to Dashboard" onPress={() => router.replace("/(tabs)")} />
    </ScreenWrapper>
  );
}
