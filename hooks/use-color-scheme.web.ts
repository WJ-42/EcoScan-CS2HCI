import { useEffect, useState } from "react";
import { useThemeContext } from "@/lib/theme-provider";

/**
 * Uses theme context so user's light/dark toggle is respected on web.
 * Returns "light" before hydration to avoid SSR mismatch.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { colorScheme } = useThemeContext();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return "light" as const;
  }

  return colorScheme;
}
