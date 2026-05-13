"use no memo";

import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";

import { getColors } from "@/lib/theme";
import { useThemeContext } from "@/lib/theme-provider";
import { TOUCH_TARGET_LARGE } from "@/lib/accessibility-constants";

/**
 * Fully custom bottom tab bar.
 *
 * We render the tab bar ourselves instead of relying on React Navigation's
 * default `BottomTabBar`. The `"use no memo"` directive at the top opts this
 * file out of the React Compiler — without it, the compiler appears to
 * over-memoize this component on the static Vercel build, so it never
 * re-reads `colorScheme` from context even when the rest of the app
 * correctly resolves to dark mode. We also read the theme context directly
 * (instead of via `useColors`) to keep the dependency chain as short and
 * obvious as possible.
 */
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colorScheme, highContrast, largerTouchTargets, simpleNavigation } = useThemeContext();
  const colors = getColors(colorScheme, highContrast);
  const insets = useSafeAreaInsets();

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
          backgroundColor: colors.background,
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
