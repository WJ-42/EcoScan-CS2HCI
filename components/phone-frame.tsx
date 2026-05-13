import { View, Platform, Dimensions, ViewStyle } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useThemeContext } from "@/lib/theme-provider";

interface PhoneFrameProps {
  children: React.ReactNode;
}

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844; // iPhone 14–style aspect ratio (~19.5:9)

/**
 * On web, wraps the app in a centered phone-sized container with a dark
 * background and device-like frame. On native, renders children directly
 * with no wrapper.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  const { colorScheme } = useThemeContext();
  const [windowHeight, setWindowHeight] = useState(
    Dimensions.get("window").height
  );

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onResize = () => {
      setWindowHeight(Dimensions.get("window").height);
    };
    const subscription = Dimensions.addEventListener("change", onResize);
    return () => subscription.remove();
  }, []);

  // Apply web-only box-shadow via ref callback
  const phoneRef = useCallback((node: View | null) => {
    if (Platform.OS === "web" && node) {
      const el = node as unknown as HTMLElement;
      if (el && el.style) {
        el.style.boxShadow =
          "0 0 0 8px #1A1A1A, 0 0 0 10px #333, 0 25px 60px rgba(0,0,0,0.6)";
      }
    }
  }, []);

  // Only apply the phone frame on web
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  const pageStyle: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
    minHeight: windowHeight,
  };

  const phoneStyle: ViewStyle = {
    width: PHONE_WIDTH,
    maxWidth: PHONE_WIDTH,
    height: Math.min(PHONE_HEIGHT, windowHeight),
    overflow: "hidden",
    borderRadius: 40,
    backgroundColor: colorScheme === "dark" ? "#111214" : "#FFFFFF",
  };

  return (
    <View style={pageStyle}>
      <View ref={phoneRef} style={phoneStyle}>
        {children}
      </View>
    </View>
  );
}
