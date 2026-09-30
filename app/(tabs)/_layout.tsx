import React from "react";
import { Tabs } from "expo-router";
import { View, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Compass, CalendarDays, Trophy, User, Plus, LucideIcon } from "lucide-react-native";
import { triggerHaptic } from "@/lib/haptics";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/stores/theme.store";

interface TabItemProps {
  icon: LucideIcon;
  focused: boolean;
  isDark: boolean;
}

function TabItem({ icon: Icon, focused, isDark }: TabItemProps) {
  return (
    <View className="items-center justify-center">
      <View
        className={`w-12 h-10 rounded-2xl items-center justify-center ${
          focused
            ? "bg-emerald-500/15 border border-emerald-500/40 shadow-sm shadow-emerald-500/20"
            : "bg-transparent"
        }`}
      >
        <Icon
          size={22}
          color={focused ? "#10b981" : isDark ? "#71717a" : "#94a3b8"}
          strokeWidth={focused ? 2.4 : 1.8}
        />
      </View>
      <View
        className={`w-1.5 h-1.5 rounded-full mt-1 ${
          focused ? "bg-emerald-500" : "bg-transparent"
        }`}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDark);
  const router = useRouter();

  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
  const barHeight =
    Platform.OS === "ios"
      ? 64 + insets.bottom
      : 66 + (insets.bottom > 0 ? insets.bottom - 4 : 4);

  const handleTabPress = () => {
    triggerHaptic();
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: isDark ? "#71717a" : "#94a3b8",
        tabBarStyle: {
          backgroundColor: isDark ? "#09090b" : "#ffffff",
          borderTopColor: isDark ? "#27272a" : "#e2e8f0",
          borderTopWidth: 1,
          height: barHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          elevation: isDark ? 10 : 8,
          shadowColor: isDark ? "#000000" : "#64748b",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDark ? 0.35 : 0.08,
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
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={Home} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={Compass} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarButton: (props) => (
            <View className="items-center justify-center top-[-18px]">
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  router.push("/booking/create" as any);
                }}
                className="w-[60px] h-[60px] rounded-full bg-emerald-500 items-center justify-center border-[4px] border-white dark:border-[#09090b] shadow-lg shadow-emerald-600/40 dark:shadow-emerald-900/60 active:scale-95 transition-transform"
              >
                <Plus size={32} color="#ffffff" strokeWidth={2.5} />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: "Bookings",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={CalendarDays} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="tournaments"
        listeners={{ tabPress: handleTabPress }}
        options={{
          href: null,
          title: "Tournaments",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={Trophy} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{ tabPress: handleTabPress }}
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabItem icon={User} focused={focused} isDark={isDark} />
          ),
        }}
      />
    </Tabs>
  );
}
