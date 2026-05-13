import { PropsWithChildren, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = useColors();

  return (
    // NOTE: inline backgroundColor instead of `bg-background` — the NativeWind
    // class resolves to `var(--color-background)` which doesn't reliably win on
    // the static export's first paint, causing a white bar in dark mode.
    <View style={{ backgroundColor: colors.background }}>
      <TouchableOpacity
        className="flex-row items-center gap-1.5"
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={colors.icon}
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
        />
        {/* Same story as bg-background: `text-foreground` resolves to a CSS
            var that NativeWind bakes as the LIGHT value during static export,
            so the title rendered as black-on-dark. Use an inline colour. */}
        <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
          {title}
        </Text>
      </TouchableOpacity>
      {isOpen && <View className="mt-1.5 ml-6">{children}</View>}
    </View>
  );
}
