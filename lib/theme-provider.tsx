import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { getSchemeColors, type ColorScheme } from "@/constants/theme";

const STORAGE_KEY_ACCESSIBILITY = "@ecoscan_accessibility";
const STORAGE_KEY_HIGH_CONTRAST_LEGACY = "@ecoscan_high_contrast";

export type AccessibilityPreset = "vision" | "motor" | "cognitive";

type AccessibilityState = {
  highContrast: boolean;
  largerText: boolean;
  largerTouchTargets: boolean;
  simpleNavigation: boolean;
};

const DEFAULT_ACCESSIBILITY: AccessibilityState = {
  highContrast: false,
  largerText: false,
  largerTouchTargets: false,
  simpleNavigation: false,
};

export const PRESETS: Record<AccessibilityPreset, AccessibilityState> = {
  vision: { highContrast: true, largerText: true, largerTouchTargets: false, simpleNavigation: false },
  motor: { highContrast: false, largerText: false, largerTouchTargets: true, simpleNavigation: true },
  cognitive: { highContrast: false, largerText: true, largerTouchTargets: false, simpleNavigation: true },
};

type ThemeContextValue = {
  colorScheme: ColorScheme;
  highContrast: boolean;
  largerText: boolean;
  largerTouchTargets: boolean;
  simpleNavigation: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  setHighContrast: (enabled: boolean) => void;
  setLargerText: (enabled: boolean) => void;
  setLargerTouchTargets: (enabled: boolean) => void;
  setSimpleNavigation: (enabled: boolean) => void;
  applyPreset: (preset: AccessibilityPreset) => void;
  resetAccessibility: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);
  const [accessibility, setAccessibilityState] = useState<AccessibilityState>(DEFAULT_ACCESSIBILITY);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userOverride, setUserOverride] = useState(false);

  // Sync with system color scheme on mount and when it changes (fixes hydration mismatch on web)
  useEffect(() => {
    if (!userOverride) {
      setColorSchemeState(systemScheme);
    }
  }, [systemScheme, userOverride]);

  const { highContrast, largerText, largerTouchTargets, simpleNavigation } = accessibility;

  useEffect(() => {
    (async () => {
      try {
        const [legacy, json] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_HIGH_CONTRAST_LEGACY),
          AsyncStorage.getItem(STORAGE_KEY_ACCESSIBILITY),
        ]);
        let state: AccessibilityState = DEFAULT_ACCESSIBILITY;
        if (json) {
          const parsed = JSON.parse(json) as Partial<AccessibilityState>;
          state = { ...DEFAULT_ACCESSIBILITY, ...parsed };
        }
        if (legacy === "true") {
          state = { ...state, highContrast: true };
          await AsyncStorage.removeItem(STORAGE_KEY_HIGH_CONTRAST_LEGACY);
        }
        setAccessibilityState(state);
      } catch {
        setAccessibilityState(DEFAULT_ACCESSIBILITY);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY_ACCESSIBILITY, JSON.stringify(accessibility));
    }
  }, [accessibility, isLoaded]);

  const applyScheme = useCallback(
    (scheme: ColorScheme, hc: boolean) => {
      nativewindColorScheme.set(scheme);
      Appearance.setColorScheme?.(scheme);
      const palette = getSchemeColors(scheme, hc);
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.dataset.theme = scheme;
        root.classList.toggle("dark", scheme === "dark");
        Object.entries(palette).forEach(([token, value]) => {
          root.style.setProperty(`--color-${token}`, value);
        });
      }
    },
    [],
  );

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setUserOverride(true);
      setColorSchemeState(scheme);
      applyScheme(scheme, highContrast);
    },
    [applyScheme, highContrast],
  );

  const setHighContrast = useCallback(
    (enabled: boolean) => {
      setAccessibilityState((s) => ({ ...s, highContrast: enabled }));
      applyScheme(colorScheme, enabled);
    },
    [applyScheme, colorScheme],
  );

  const setLargerText = useCallback((enabled: boolean) => {
    setAccessibilityState((s) => ({ ...s, largerText: enabled }));
  }, []);

  const setLargerTouchTargets = useCallback((enabled: boolean) => {
    setAccessibilityState((s) => ({ ...s, largerTouchTargets: enabled }));
  }, []);

  const setSimpleNavigation = useCallback((enabled: boolean) => {
    setAccessibilityState((s) => ({ ...s, simpleNavigation: enabled }));
  }, []);

  const applyPreset = useCallback(
    (preset: AccessibilityPreset) => {
      const next = PRESETS[preset];
      setAccessibilityState(next);
      applyScheme(colorScheme, next.highContrast);
    },
    [applyScheme, colorScheme],
  );

  const resetAccessibility = useCallback(() => {
    setAccessibilityState(DEFAULT_ACCESSIBILITY);
    applyScheme(colorScheme, false);
  }, [applyScheme, colorScheme]);

  useEffect(() => {
    if (isLoaded) {
      applyScheme(colorScheme, highContrast);
    }
  }, [applyScheme, colorScheme, highContrast, isLoaded]);

  const themeVariables = useMemo(
    () => {
      const palette = getSchemeColors(colorScheme, highContrast);
      return vars({
        "color-primary": palette.primary,
        "color-background": palette.background,
        "color-surface": palette.surface,
        "color-foreground": palette.foreground,
        "color-muted": palette.muted,
        "color-border": palette.border,
        "color-success": palette.success,
        "color-warning": palette.warning,
        "color-error": palette.error,
      });
    },
    [colorScheme, highContrast],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      highContrast,
      largerText,
      largerTouchTargets,
      simpleNavigation,
      setColorScheme,
      setHighContrast,
      setLargerText,
      setLargerTouchTargets,
      setSimpleNavigation,
      applyPreset,
      resetAccessibility,
    }),
    [
      colorScheme,
      highContrast,
      largerText,
      largerTouchTargets,
      simpleNavigation,
      setColorScheme,
      setHighContrast,
      setLargerText,
      setLargerTouchTargets,
      setSimpleNavigation,
      applyPreset,
      resetAccessibility,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
