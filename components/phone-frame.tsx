import { View, Platform, ViewStyle } from "react-native";
import { useCallback, useEffect, useState } from "react";

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

  // Initialize with a sensible default; update on client after mount
  const [windowHeight, setWindowHeight] = useState<number>(PHONE_HEIGHT);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;

    setMounted(true);
    setWindowHeight(window.innerHeight);

    const onResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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

  // Use window height once mounted; fall back to PHONE_HEIGHT during SSR
  const effectiveHeight = mounted ? windowHeight : PHONE_HEIGHT;
  const phoneHeight = Math.min(PHONE_HEIGHT, effectiveHeight);

  const pageStyle: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    minHeight: effectiveHeight,
  };

  const phoneStyle: ViewStyle = {
    width: PHONE_WIDTH,
    maxWidth: PHONE_WIDTH,
    height: phoneHeight,
    overflow: "hidden",
    borderRadius: 40,
    backgroundColor: "#111214",
  };

  return (
    <View style={pageStyle}>
      <View ref={phoneRef} style={phoneStyle}>
        {children}
      </View>
    </View>
  );
}