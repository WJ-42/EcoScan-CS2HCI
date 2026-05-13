import { useEffect, useState } from "react";
import { useThemeContext } from "@/lib/theme-provider";

// Read the saved scheme synchronously before React hydrates
// so screens get the right colour on the very first render
function getInitialScheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage?.getItem("@ecoscan_color_scheme");
    if (stored === "dark" || stored === "light") return stored;
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  } catch {
    // ignore privacy mode / sandboxed errors
  }
  return "light";
}

/**
 * Uses theme context so user's light/dark toggle is respected on web.
 * Falls back to the synchronously-read stored/system scheme before hydration
 * to avoid a flash of the wrong theme on first load.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { colorScheme } = useThemeContext();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return getInitialScheme();
  }

  return colorScheme;
}