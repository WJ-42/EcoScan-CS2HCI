import {
  getMinTouchTarget,
  scaleFontSize as scaleFontSizeUtil,
} from "@/lib/accessibility-constants";
import { useThemeContext } from "@/lib/theme-provider";

export function useAccessibility() {
  const {
    largerText,
    highContrast,
    largerTouchTargets,
    simpleNavigation,
  } = useThemeContext();

  const scaleFontSize = (base: number) => scaleFontSizeUtil(base, largerText);
  const minTouchTarget = getMinTouchTarget(largerTouchTargets);

  return {
    largerText,
    highContrast,
    largerTouchTargets,
    simpleNavigation,
    scaleFontSize,
    minTouchTarget,
  };
}
