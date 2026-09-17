import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Input, Button, Card } from "@/components/ui";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await authApi.login({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (response && response.token && response.user) {
        await setAuth(response.token, response.user);
        router.replace("/(tabs)");
      } else {
        setErrorMessage("Authentication failed. Please verify your credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable className="justify-center py-10">
      {/* Brand Header */}
      <View className="items-center my-6">
        <View className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center mb-3 shadow-lg shadow-emerald-950">
          <Text className="text-3xl">⚽</Text>
        </View>
        <Text className="text-3xl font-black text-white tracking-tight">
          Turf<Text className="text-emerald-500">Slot</Text>
        </Text>
        <Text className="text-zinc-400 text-xs mt-1">
          Sports Venue Management & Slot Booking
        </Text>
      </View>

      {/* Login Card */}
      <Card className="p-6 bg-zinc-900 border-zinc-800 shadow-xl shadow-black/50">
        <Text className="text-white font-bold text-xl mb-1">
          Welcome Back
        </Text>
        <Text className="text-zinc-400 text-xs mb-5">
          Sign in with your account credentials to access your dashboard
        </Text>

        {errorMessage ? (
          <View className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 mb-4">
            <Text className="text-red-400 text-xs font-medium">
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Input
          label="Email Address"
          placeholder="e.g. name@turfslot.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          variant="primary"
          size="lg"
          className="mt-3"
        />
      </Card>

      {/* Footer Register Link */}
      <View className="flex-row justify-center items-center mt-6">
        <Text className="text-zinc-400 text-sm">Don't have an account? </Text>
        <Pressable onPress={() => router.push("/(auth)/register")}>
          <Text className="text-emerald-400 font-semibold text-sm">
            Sign Up
          </Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
