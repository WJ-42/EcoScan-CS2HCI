/**
 * Web camera barcode scanner using @zxing/browser.
 * Renders a live video feed and scans for EAN-13, UPC, Code 128, etc.
 */
import { useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";

// Only import on web - this file has .web.tsx extension so it's never loaded on native
import { BrowserMultiFormatReader } from "@zxing/browser";

export interface WebBarcodeScannerProps {
  onBarcodeScanned: (data: string) => void;
  scanned: boolean;
  onScanStarted?: () => void;
  onScanError?: (error: Error) => void;
}

export function WebBarcodeScanner({
  onBarcodeScanned,
  scanned,
  onScanStarted,
  onScanError,
}: WebBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const scannedRef = useRef(false);
  scannedRef.current = scanned;

  const onBarcodeScannedRef = useRef(onBarcodeScanned);
  const onScanErrorRef = useRef(onScanError);
  onBarcodeScannedRef.current = onBarcodeScanned;
  onScanErrorRef.current = onScanError;

  const handleScan = useCallback((data: string) => {
    if (!scannedRef.current && data) {
      onBarcodeScannedRef.current(data);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    let mounted = true;
    const codeReader = new BrowserMultiFormatReader();

    const startScan = async () => {
      // Brief delay so the browser can release the previous camera stream when remounting
      await new Promise((r) => setTimeout(r, 200));
      if (!mounted) return;
      try {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        const defaultDevice =
          videoInputDevices.find((d: MediaDeviceInfo) =>
            d.label.toLowerCase().includes("back")
          ) || videoInputDevices[0];

        if (!defaultDevice) {
          throw new Error("No camera found");
        }

        // Create video element if not exists
        let video = videoRef.current;
        if (!video && containerRef.current) {
          video = document.createElement("video");
          video.setAttribute("playsinline", "true");
          video.setAttribute("muted", "true");
          video.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100%; height: 100%;
            object-fit: cover;
          `;
          containerRef.current.appendChild(video);
          videoRef.current = video;
        }

        if (!video || !mounted) return;

        const controls = await codeReader.decodeFromVideoDevice(
          defaultDevice.deviceId,
          video,
          (result, err) => {
            if (!mounted) return;
            if (result) {
              const text = result.getText();
              if (text) handleScan(text);
            }
            // Only NotFoundException is expected during scanning (no barcode in frame).
            // Don't report other decode errors as camera failure - they're transient.
          }
        );

        controlsRef.current = controls;
        onScanStarted?.();
      } catch (err) {
        if (mounted) {
          onScanErrorRef.current?.(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    startScan();

    return () => {
      mounted = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
      if (videoRef.current?.parentNode === containerRef.current) {
        containerRef.current!.removeChild(videoRef.current);
      }
      videoRef.current = null;
    };
    // Empty deps - only run on mount, use refs for callbacks so we don't restart on parent re-renders
  }, []);

  if (Platform.OS !== "web") return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      />
    </View>
  );
}
