import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper, Input, Button, Card } from "@/components/ui";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const response = await authApi.register({
        name,
        email,
        phone,
        password,
        role: "user",
      });

      if (response && response.token) {
        await setAuth(response.token, response.user);
        router.replace("/(tabs)");
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable className="justify-center items-center py-6">
      <View className="w-full max-w-md self-center">
        {/* Header */}
        <View className="items-center my-4">
          <Text className="text-2xl font-black text-slate-900 dark:text-white">Create Account</Text>
          <Text className="text-slate-500 dark:text-zinc-400 text-xs mt-1 font-medium">
            Join TurfSlot to book your favorite slots
          </Text>
        </View>

        <Card className="p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50">
          {errorMessage ? (
            <View className="bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-xl p-3 mb-4">
              <Text className="text-red-600 dark:text-red-400 text-xs font-medium">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Input
            label="Full Name"
            placeholder="e.g. Sabbir Hossain"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Email Address"
            placeholder="user@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone Number"
            placeholder="017XXXXXXXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            variant="primary"
            className="mt-2"
          />
        </Card>

        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-slate-500 dark:text-zinc-400 text-sm">Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}
