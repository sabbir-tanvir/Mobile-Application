import React from "react";
import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Compass, CalendarDays, Trophy, User } from "lucide-react-native";

interface TabItemProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  focused: boolean;
}

function TabItem({ icon: Icon, focused }: TabItemProps) {
  return (
    <View className="items-center justify-center">
      <View
        className={`w-12 h-10 rounded-2xl items-center justify-center ${
          focused
            ? "bg-emerald-500/15 border border-emerald-500/40"
            : "bg-transparent"
        }`}
      >
        <Icon
          size={22}
          color={focused ? "#10b981" : "#71717a"}
          strokeWidth={focused ? 2.4 : 1.8}
        />
      </View>
      <View
        className={`w-1 h-1 rounded-full mt-1 ${
          focused ? "bg-emerald-400" : "bg-transparent"
        }`}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
  const barHeight =
    Platform.OS === "ios"
      ? 64 + insets.bottom
      : 66 + (insets.bottom > 0 ? insets.bottom - 4 : 4);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#71717a",
        tabBarStyle: {
          backgroundColor: "#09090b",
          borderTopColor: "#27272a",
          borderTopWidth: 1,
          height: barHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={Home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={Compass} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={CalendarDays} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          title: "Events",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={Trophy} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={User} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
