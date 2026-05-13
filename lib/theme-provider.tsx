import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { getSchemeColors, type ColorScheme } from "@/constants/theme";

const STORAGE_KEY_ACCESSIBILITY = "@ecoscan_accessibility";
const STORAGE_KEY_HIGH_CONTRAST_LEGACY = "@ecoscan_high_contrast";
const STORAGE_KEY_SCHEME = "@ecoscan_color_scheme";

/**
 * Synchronously read the persisted color scheme from `localStorage`.
 *
 * `AsyncStorage` is promise-based even on web, so by the time it resolves the
 * provider has already rendered (and committed) with the wrong scheme — which
 * causes a flash of light-mode styling on every page load. On web,
 * `AsyncStorage` is backed by `localStorage` using the same keys, so we can
 * read it synchronously here to seed the initial state and DOM correctly.
 */
function readStoredScheme(): ColorScheme | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage?.getItem(STORAGE_KEY_SCHEME);
    if (value === "light" || value === "dark") return value;
  } catch {
    // localStorage can throw in privacy modes / sandboxed iframes — ignore.
  }
  return null;
}

function readStoredHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY_ACCESSIBILITY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AccessibilityState>;
      if (parsed && typeof parsed.highContrast === "boolean") return parsed.highContrast;
    }
    if (window.localStorage?.getItem(STORAGE_KEY_HIGH_CONTRAST_LEGACY) === "true") return true;
  } catch {
    // ignore
  }
  return false;
}

function applySchemeToDom(scheme: ColorScheme, highContrast: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = scheme;
  root.classList.toggle("dark", scheme === "dark");
  const palette = getSchemeColors(scheme, highContrast);
  Object.entries(palette).forEach(([token, value]) => {
    root.style.setProperty(`--color-${token}`, value);
  });
}

// Apply the persisted theme to the DOM *before* React renders to eliminate the
// flash of light-mode content. Runs once at module load on the client only.
const INITIAL_STORED_SCHEME = readStoredScheme();
const INITIAL_STORED_HIGH_CONTRAST = readStoredHighContrast();
if (INITIAL_STORED_SCHEME) {
  nativewindColorScheme.set(INITIAL_STORED_SCHEME);
  applySchemeToDom(INITIAL_STORED_SCHEME, INITIAL_STORED_HIGH_CONTRAST);
}

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

  // Seed state from the same synchronous source the module-level code used so
  // the first render produces inline CSS vars that match the DOM already set.
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    () => INITIAL_STORED_SCHEME ?? systemScheme,
  );
  const [accessibility, setAccessibilityState] = useState<AccessibilityState>(() => ({
    ...DEFAULT_ACCESSIBILITY,
    highContrast: INITIAL_STORED_HIGH_CONTRAST,
  }));
  const [isLoaded, setIsLoaded] = useState(false);
  const [userOverride, setUserOverride] = useState<boolean>(() => INITIAL_STORED_SCHEME !== null);

  // Sync with system color scheme on mount and when it changes (fixes hydration mismatch on web)
  useEffect(() => {
    if (!userOverride) {
      setColorSchemeState(systemScheme);
    }
  }, [systemScheme, userOverride]);

  const { highContrast, largerText, largerTouchTargets, simpleNavigation } = accessibility;

  const applyScheme = useCallback((scheme: ColorScheme, hc: boolean) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    applySchemeToDom(scheme, hc);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [legacy, json, savedScheme] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_HIGH_CONTRAST_LEGACY),
          AsyncStorage.getItem(STORAGE_KEY_ACCESSIBILITY),
          AsyncStorage.getItem(STORAGE_KEY_SCHEME),
        ]);
        let state: AccessibilityState = {
          ...DEFAULT_ACCESSIBILITY,
          highContrast: INITIAL_STORED_HIGH_CONTRAST,
        };
        if (json) {
          const parsed = JSON.parse(json) as Partial<AccessibilityState>;
          state = { ...DEFAULT_ACCESSIBILITY, ...parsed };
        }
        if (legacy === "true") {
          state = { ...state, highContrast: true };
          await AsyncStorage.removeItem(STORAGE_KEY_HIGH_CONTRAST_LEGACY);
        }
        setAccessibilityState(state);
        if (savedScheme === "light" || savedScheme === "dark") {
          setColorSchemeState(savedScheme);
          setUserOverride(true);
          applyScheme(savedScheme, state.highContrast);
        }
      } catch {
        // keep current state
      } finally {
        setIsLoaded(true);
      }
    })();
  }, [applyScheme]);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY_ACCESSIBILITY, JSON.stringify(accessibility));
    }
  }, [accessibility, isLoaded]);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setUserOverride(true);
      setColorSchemeState(scheme);
      AsyncStorage.setItem(STORAGE_KEY_SCHEME, scheme);
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
