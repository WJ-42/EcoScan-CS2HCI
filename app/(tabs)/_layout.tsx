import { Tabs } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const { simpleNavigation } = useAccessibility();
  const colors = useColors();
  const iconSize = simpleNavigation ? 28 : 26;
  const barHeight = simpleNavigation ? 78 : 64;
  const verticalPad = simpleNavigation ? 12 : 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: barHeight,
          paddingTop: verticalPad,
          paddingBottom: verticalPad,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: simpleNavigation ? 14 : 12,
          paddingBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={iconSize} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={iconSize} name="barcode.viewfinder" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={iconSize} name="clock.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={iconSize} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
