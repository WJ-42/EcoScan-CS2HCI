import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/use-colors";
import { useAccessibility } from "@/hooks/use-accessibility";
import { TOUCH_TARGET_LARGE } from "@/lib/accessibility-constants";

/**
 * Fully custom bottom tab bar.
 *
 * We render the tab bar ourselves instead of relying on React Navigation's
 * default `BottomTabBar`, because that default doesn't reliably pick up
 * `tabBarStyle.backgroundColor` updates on the static web build / hydration
 * — so it stayed white on first load even after the rest of the app had
 * correctly resolved to dark mode. Rendering inline-styled Views straight
 * from `useColors()` is the same pattern that fixed `ScreenContainer`.
 */
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { largerTouchTargets, simpleNavigation } = useAccessibility();

  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const useLargeNav = largerTouchTargets || simpleNavigation;
  const tabMinTouch = useLargeNav ? TOUCH_TARGET_LARGE : 44;
  const tabBarHeight = (simpleNavigation ? 78 : 62) + bottomPadding;
  const labelFontSize = simpleNavigation ? 14 : 12;
  const iconSize = simpleNavigation ? 28 : 26;

  const handlePressIn = useCallback(() => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  return (
    <View
      style={[
        styles.bar,
        {
          // TEMPORARY DIAGNOSTIC: bright pink to verify this component is
          // the one actually rendering on the deployed Vercel build. Revert
          // once we know whether expo-router is honoring the tabBar prop.
          backgroundColor: "#FF00FF",
          borderTopColor: colors.border,
          paddingTop: simpleNavigation ? 12 : 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const tintColor = focused ? colors.tint : colors.muted;
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : (options.title ?? route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.dispatch({
              ...CommonActions.navigate(route),
              target: state.key,
            });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            style={({ pressed }) => [
              styles.item,
              { minHeight: tabMinTouch, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            {options.tabBarIcon?.({ focused, color: tintColor, size: iconSize })}
            <Text style={[styles.label, { color: tintColor, fontSize: labelFontSize }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 0.5,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    paddingBottom: 4,
  },
});
