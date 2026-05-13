import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useScanHistory } from "@/lib/scan-history-context";
import { getProductByBarcode, PRODUCTS } from "@/lib/mock-data";
import { WebBarcodeScanner } from "@/components/web-barcode-scanner";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

// Camera is only available on native, use dynamic import approach
let CameraView: any = null;
let useCameraPermissions: any = null;

try {
  const cam = require("expo-camera");
  CameraView = cam.CameraView;
  useCameraPermissions = cam.useCameraPermissions;
} catch {
  // Camera not available (web)
}

// Stable fallback so the hook is always called unconditionally inside the component
const usePermissions: () => [any, () => void] =
  useCameraPermissions ?? (() => [null, () => {}]);

export default function ScanScreen() {
  const router = useRouter();
  const colors = useColors();
  const { addScan } = useScanHistory();
  const [scanned, setScanned] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [webCameraError, setWebCameraError] = useState(false);
  const [cameraRetryKey, setCameraRetryKey] = useState(0);

  const [permission, requestPermission] = usePermissions();

  const isWeb = Platform.OS === "web";

  const handleBarcodeLookup = useCallback(
    (barcode: string) => {
      const product = getProductByBarcode(barcode);
      if (product) {
        addScan(product.id);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.push(`/products/${product.id}` as any);
      } else {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        Alert.alert(
          "Product Not Found",
          "This barcode is not in our database yet. Try scanning another product.",
          [{ text: "OK", onPress: () => setScanned(false) }]
        );
      }
    },
    [addScan, router]
  );

  const handleBarcodeScanned = useCallback(
    ({ data }: { type: string; data: string }) => {
      if (scanned) return;
      setScanned(true);
      handleBarcodeLookup(data);
    },
    [scanned, handleBarcodeLookup]
  );

  const handleWebBarcodeScanned = useCallback(
    (data: string) => {
      if (scanned) return;
      setScanned(true);
      handleBarcodeLookup(data);
    },
    [scanned, handleBarcodeLookup]
  );

  const handleWebScanError = useCallback(() => setWebCameraError(true), []);

  const handleManualSubmit = useCallback(() => {
    if (manualBarcode.trim().length > 0) {
      handleBarcodeLookup(manualBarcode.trim());
      setManualBarcode("");
    }
  }, [manualBarcode, handleBarcodeLookup]);

  // Demo quick-scan buttons for testing - show variety of grades (A, B, C, D)
  const demoProducts = [
    PRODUCTS.find(p => p.id === "1"), // Organic Oat Milk (A)
    PRODUCTS.find(p => p.id === "3"), // Soy Milk (B)
    PRODUCTS.find(p => p.id === "2"), // Almond Milk (C)
    PRODUCTS.find(p => p.id === "11"), // Standard Paper Towels (D)
  ].filter((p): p is typeof PRODUCTS[0] => p !== undefined);

  // Manual entry: on web when user chose it or camera failed; on native when user chose it or no permission
  const showManualView =
    (isWeb && (showManualEntry || webCameraError)) ||
    (!isWeb && (showManualEntry || (permission && !permission.granted)));

  // On web: keep camera mounted and overlay manual entry when needed (avoids camera restart issues)
  if (isWeb) {
    return (
      <View style={styles.cameraContainer}>
        <WebBarcodeScanner
          key={cameraRetryKey}
          onBarcodeScanned={handleWebBarcodeScanned}
          scanned={scanned}
          onScanError={handleWebScanError}
        />
        {!showManualView && (
          <View style={styles.overlay}>
            <View style={styles.topBar}>
              <Text style={styles.scanTitle}>Scan Barcode</Text>
              <Pressable
                onPress={() => setShowManualEntry(true)}
                style={({ pressed }) => [
                  styles.torchButton,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityLabel="Enter barcode manually"
                accessibilityRole="button"
              >
                <MaterialIcons name="keyboard" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.scanGuideContainer}>
              <View style={styles.scanGuide}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.scanHint}>
                Point camera at a product barcode
              </Text>
            </View>
            <View style={styles.bottomBar}>
              <Pressable
                onPress={() => setShowManualEntry(true)}
                style={({ pressed }) => [
                  styles.manualButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <MaterialIcons name="keyboard" size={20} color="#FFFFFF" />
                <Text style={styles.manualButtonText}>Enter Manually</Text>
              </Pressable>
              {scanned && (
                <Pressable
                  onPress={() => setScanned(false)}
                  style={({ pressed }) => [
                    styles.rescanButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.manualButtonText}>Scan Again</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
        {showManualView && (
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.manualOverlay,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.manualContainer}>
              <View style={styles.manualHeader}>
                <MaterialIcons name="qr-code-scanner" size={64} color={colors.primary} />
                <Text style={[styles.manualTitle, { color: colors.foreground }]}>
                  Barcode Scanner
                </Text>
                <Text style={[styles.manualSubtitle, { color: colors.muted }]}>
                  {webCameraError
                    ? "Camera is unavailable. Enter the barcode manually or try a demo product below."
                    : "Type the barcode number or try a demo product below."}
                </Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.barcodeInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.foreground,
                    },
                  ]}
                  placeholder="Enter barcode number..."
                  placeholderTextColor={colors.muted}
                  value={manualBarcode}
                  onChangeText={setManualBarcode}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleManualSubmit}
                />
                <Pressable
                  onPress={handleManualSubmit}
                  style={({ pressed }) => [
                    styles.searchButton,
                    { backgroundColor: colors.primary },
                    pressed && { opacity: 0.8 },
                  ]}
                  accessibilityLabel="Search barcode"
                  accessibilityRole="button"
                >
                  <MaterialIcons name="search" size={24} color="#FFFFFF" />
                </Pressable>
              </View>
              <View style={styles.demoSection}>
                <Text style={[styles.demoTitle, { color: colors.muted }]}>
                  Try a Demo Product
                </Text>
                {demoProducts.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => {
                      addScan(product.id);
                      router.push(`/products/${product.id}` as any);
                    }}
                    style={({ pressed }) => [
                      styles.demoItem,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityLabel={`Demo: ${product.name}`}
                    accessibilityRole="button"
                  >
                    <View style={styles.demoItemContent}>
                      <Text style={[styles.demoItemName, { color: colors.foreground }]}>
                        {product.name}
                      </Text>
                      <Text style={[styles.demoItemBarcode, { color: colors.muted }]}>
                        {product.barcode}
                      </Text>
                    </View>
                    <MaterialIcons name="arrow-forward" size={20} color={colors.muted} />
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={() => {
                  setShowManualEntry(false);
                  setScanned(false);
                  setWebCameraError(false);
                  if (webCameraError) setCameraRetryKey((k) => k + 1);
                }}
                style={({ pressed }) => [
                  styles.backToCamera,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.backToCameraText, { color: colors.primary }]}>
                  Back to Camera Scanner
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  }

  if (showManualView) {
    return (
      <ScreenContainer>
        <View style={styles.manualContainer}>
          <View style={styles.manualHeader}>
            <MaterialIcons name="qr-code-scanner" size={64} color={colors.primary} />
            <Text style={[styles.manualTitle, { color: colors.foreground }]}>
              {isWeb ? "Barcode Scanner" : "Enter Barcode"}
            </Text>
            <Text style={[styles.manualSubtitle, { color: colors.muted }]}>
              {isWeb && webCameraError
                ? "Camera is unavailable. Enter the barcode manually or try a demo product below."
                : isWeb
                  ? "Type the barcode number or try a demo product below."
                  : "Type the barcode number from the product packaging."}
            </Text>
          </View>

          {/* Manual barcode input */}
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.barcodeInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Enter barcode number..."
              placeholderTextColor={colors.muted}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleManualSubmit}
            />
            <Pressable
              onPress={handleManualSubmit}
              style={({ pressed }) => [
                styles.searchButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
              accessibilityLabel="Search barcode"
              accessibilityRole="button"
            >
              <MaterialIcons name="search" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Demo products for quick testing */}
          <View style={styles.demoSection}>
            <Text style={[styles.demoTitle, { color: colors.muted }]}>
              Try a Demo Product
            </Text>
            {demoProducts.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => {
                  addScan(product.id);
                  router.push(`/products/${product.id}` as any);
                }}
                style={({ pressed }) => [
                  styles.demoItem,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityLabel={`Demo: ${product.name}`}
                accessibilityRole="button"
              >
                <View style={styles.demoItemContent}>
                  <Text style={[styles.demoItemName, { color: colors.foreground }]}>
                    {product.name}
                  </Text>
                  <Text style={[styles.demoItemBarcode, { color: colors.muted }]}>
                    {product.barcode}
                  </Text>
                </View>
                <MaterialIcons name="arrow-forward" size={20} color={colors.muted} />
              </Pressable>
            ))}
          </View>

          {isWeb && (
            <Pressable
              onPress={() => {
                setShowManualEntry(false);
                setScanned(false);
                setWebCameraError(false);
              }}
              style={({ pressed }) => [
                styles.backToCamera,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.backToCameraText, { color: colors.primary }]}>
                Back to Camera Scanner
              </Text>
            </Pressable>
          )}
        </View>
      </ScreenContainer>
    );
  }

  // Camera permission not yet determined (native only)
  if (!permission) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text style={[styles.permissionText, { color: colors.muted }]}>
            Loading camera...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Camera permission not granted
  if (!permission.granted) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <MaterialIcons name="camera-alt" size={64} color={colors.muted} />
          <Text style={[styles.permissionTitle, { color: colors.foreground }]}>
            Camera Permission Needed
          </Text>
          <Text style={[styles.permissionText, { color: colors.muted }]}>
            We need camera access to scan product barcodes.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // Camera scanner view (native only)
  return (
    <View style={styles.cameraContainer}>
      {CameraView && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          enableTorch={torchOn}
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.scanTitle}>Scan Barcode</Text>
          <Pressable
            onPress={() => setTorchOn(!torchOn)}
            style={({ pressed }) => [
              styles.torchButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel={torchOn ? "Turn off torch" : "Turn on torch"}
            accessibilityRole="button"
          >
            <MaterialIcons
              name={torchOn ? "flash-on" : "flash-off"}
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {/* Scan guide */}
        <View style={styles.scanGuideContainer}>
          <View style={styles.scanGuide}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.scanHint}>
            Point camera at a product barcode
          </Text>
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={() => setShowManualEntry(true)}
            style={({ pressed }) => [
              styles.manualButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <MaterialIcons name="keyboard" size={20} color="#FFFFFF" />
            <Text style={styles.manualButtonText}>Enter Manually</Text>
          </Pressable>
          {scanned && (
            <Pressable
              onPress={() => setScanned(false)}
              style={({ pressed }) => [
                styles.rescanButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.manualButtonText}>Scan Again</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  torchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanGuideContainer: {
    alignItems: "center",
    gap: 20,
  },
  scanGuide: {
    width: 260,
    height: 160,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FFFFFF",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanHint: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  manualButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  rescanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  manualButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Manual entry styles
  manualOverlay: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 60,
    justifyContent: "flex-start",
  },
  manualContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  manualHeader: {
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  manualTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  manualSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
  },
  barcodeInput: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  demoSection: {
    gap: 10,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  demoItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  demoItemContent: {
    flex: 1,
    gap: 2,
  },
  demoItemName: {
    fontSize: 15,
    fontWeight: "600",
  },
  demoItemBarcode: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  backToCamera: {
    alignItems: "center",
    marginTop: 24,
    padding: 12,
  },
  backToCameraText: {
    fontSize: 15,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  permissionText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  permissionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
