/**
 * Native stub - camera scanning uses expo-camera in scan.tsx directly.
 * The actual web implementation is in web-barcode-scanner.web.tsx
 */
export interface WebBarcodeScannerProps {
  onBarcodeScanned: (data: string) => void;
  scanned: boolean;
  onScanStarted?: () => void;
  onScanError?: (error: Error) => void;
}

export function WebBarcodeScanner(_props: WebBarcodeScannerProps) {
  return null;
}
