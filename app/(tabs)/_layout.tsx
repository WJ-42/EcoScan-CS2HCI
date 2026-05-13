import { Platform } from "react-native";
import { Tabs } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const { simpleNavigation } = useAccessibility();
  const colors = useColors();
  const iconSize = simpleNavigation ? 28 : 26;

  // On web, point the bar's colours at the CSS variables our `ThemeProvider`
  // keeps in sync on `document.documentElement`. The browser resolves them at
  // paint time, so the bar reacts to theme changes via the CSS cascade — no
  // dependency on React re-rendering. This dodges the React Compiler
  // memoisation that froze previous attempts at the light palette in the
  // Vercel static build. On native we just use the inline palette values.
  const isWeb = Platform.OS === "web";
  const bgColor = isWeb ? "var(--color-background)" : colors.background;
  const borderColor = isWeb ? "var(--color-border)" : colors.border;
  const activeTint = isWeb ? "var(--color-primary)" : colors.tint;
  const inactiveTint = isWeb ? "var(--color-muted)" : colors.muted;
  const barHeight = simpleNavigation ? 78 : 64;
  const verticalPad = simpleNavigation ? 12 : 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          height: barHeight,
          paddingTop: verticalPad,
          paddingBottom: verticalPad,
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
