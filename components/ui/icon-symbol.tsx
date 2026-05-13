// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "barcode.viewfinder": "qr-code-scanner",
  "clock.fill": "history",
  "person.fill": "person",
  "leaf.fill": "eco",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "star.fill": "star",
  "star": "star-border",
  "xmark": "close",
  "flashlight.on.fill": "flash-on",
  "flashlight.off.fill": "flash-off",
  "arrow.counterclockwise": "refresh",
  "heart.fill": "favorite",
  "heart": "favorite-border",
  "magnifyingglass": "search",
  "pencil": "edit",
  "paperplane.fill": "send",
  "info.circle.fill": "info",
  "globe.americas.fill": "public",
  "shippingbox.fill": "inventory-2",
  "carbon.dioxide.cloud.fill": "cloud",
  "arrow.right": "arrow-forward",
  "checkmark.circle.fill": "check-circle",
  "exclamationmark.triangle.fill": "warning",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
