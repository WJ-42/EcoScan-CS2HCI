import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/nativewind-pressable";
import { ThemeProvider, useThemeContext } from "@/lib/theme-provider";
import {
  ThemeProvider as NavThemeProvider,
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  type Theme as NavTheme,
} from "@react-navigation/native";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { ScanHistoryProvider } from "@/lib/scan-history-context";
import { PhoneFrame } from "@/components/phone-frame";
import { getSchemeColors } from "@/constants/theme";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    // Listen for window resizes on web to recalculate frame
    const handleResize = () => {
      if (typeof window === "undefined") return;
      handleSafeAreaUpdate({
        insets,
        frame: {
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleSafeAreaUpdate, insets]);

  // Create query client once and reuse it
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ScanHistoryProvider>
          <NavThemeBridge>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="products/[id]" />
              <Stack.Screen name="products/[id]/alternatives" />
              <Stack.Screen name="products/[id]/reviews" />
              <Stack.Screen name="products/[id]/write-review" />
            </Stack>
          </NavThemeBridge>
          <StatusBar style="auto" />
        </ScanHistoryProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <PhoneFrame>
          <SafeAreaProvider initialMetrics={providerInitialMetrics}>
            <SafeAreaFrameContext.Provider value={frame}>
              <SafeAreaInsetsContext.Provider value={insets}>
                {content}
              </SafeAreaInsetsContext.Provider>
            </SafeAreaFrameContext.Provider>
          </SafeAreaProvider>
        </PhoneFrame>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}

/**
 * Feed React Navigation a theme derived from our palette.
 *
 * `expo-router` mounts a `NavigationContainer` internally, and
 * `NavigationContainer` always wraps its children with its own React Navigation
 * `ThemeProvider` (defaulting to the light `DefaultTheme`). That inner provider
 * overrides any `NavThemeProvider` we set *outside* the container — which is
 * why header/tab-bar chrome stayed light even when our app palette was dark.
 *
 * Wrapping the `Stack` here positions our `NavThemeProvider` *inside* the
 * container, so it wins for everything below it.
 */
function NavThemeBridge({ children }: { children: ReactNode }) {
  const { colorScheme, highContrast } = useThemeContext();
  const navTheme = useMemo<NavTheme>(() => {
    const base = colorScheme === "dark" ? NavDarkTheme : NavDefaultTheme;
    const palette = getSchemeColors(colorScheme, highContrast);
    return {
      ...base,
      dark: colorScheme === "dark",
      colors: {
        ...base.colors,
        primary: palette.primary,
        background: palette.background,
        card: palette.background,
        text: palette.foreground,
        border: palette.border,
        notification: palette.error,
      },
    };
  }, [colorScheme, highContrast]);

  return <NavThemeProvider value={navTheme}>{children}</NavThemeProvider>;
}
