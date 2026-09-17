import React from "react";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";

interface TabBarIconProps {
  icon: string;
  focused: boolean;
  label: string;
}

function TabIcon({ icon, focused, label }: TabBarIconProps) {
  return (
    <View className="items-center justify-center pt-1">
      <Text className="text-xl">{icon}</Text>
      <Text
        className={`text-[10px] mt-0.5 font-medium ${
          focused ? "text-emerald-400 font-bold" : "text-zinc-500"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#09090b",
          borderTopColor: "#27272a",
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🔍" focused={focused} label="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" focused={focused} label="Bookings" />
          ),
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          title: "Events",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏆" focused={focused} label="Tournaments" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}
