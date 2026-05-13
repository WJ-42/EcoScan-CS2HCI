import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const { simpleNavigation, largerTouchTargets } = useAccessibility();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const iconSize = simpleNavigation ? 28 : 26;
  const tabMinTouch = largerTouchTargets || simpleNavigation ? 56 : 44;
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = (simpleNavigation ? 78 : 62) + bottomPadding;

  // On web, render a background View whose color is driven by the CSS variable
  // set synchronously at module load — bypasses React state for the first paint.
  const tabBarBackground =
    Platform.OS === "web"
      ? () => (
          <View
            style={{
              position: "absolute",
              inset: 0,
              // @ts-expect-error — CSS variables work in RN Web style objects at runtime
              backgroundColor: "var(--color-background)",
            }}
          />
        )
      : undefined;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: Platform.OS === "web" ? "transparent" : colors.background,
          borderTopColor: colors.border,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: simpleNavigation ? 14 : 12,
          paddingBottom: 2,
        },
        tabBarItemStyle: {
          minHeight: tabMinTouch,
          minWidth: tabMinTouch,
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
