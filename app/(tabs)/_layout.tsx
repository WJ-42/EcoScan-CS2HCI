import { Tabs } from "expo-router";

import { CustomTabBar } from "@/components/custom-tab-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAccessibility } from "@/hooks/use-accessibility";

export default function TabLayout() {
  const { simpleNavigation } = useAccessibility();
  const iconSize = simpleNavigation ? 28 : 26;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
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
