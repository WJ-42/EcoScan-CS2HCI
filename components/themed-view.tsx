import { View, type ViewProps } from "react-native";

import { useColors } from "@/hooks/use-colors";

export interface ThemedViewProps extends ViewProps {
  className?: string;
}

/**
 * A View component with automatic theme-aware background.
 * Background color is sourced from React state directly (via `useColors`) to
 * avoid the unreliable CSS-variable cascade for the `bg-background` class on
 * the static web build.
 */
export function ThemedView({ className, style, ...otherProps }: ThemedViewProps) {
  const colors = useColors();
  return (
    <View
      className={className}
      style={[{ backgroundColor: colors.background }, style]}
      {...otherProps}
    />
  );
}
