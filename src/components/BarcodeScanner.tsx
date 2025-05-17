import React, { useRef } from "react";
import ErrorDisplay from "./barcode-scanner/ErrorDisplay";
import ScannerOverlay from "./barcode-scanner/ScannerOverlay";
import { useBarcodeScanner } from "./barcode-scanner/useBarcodeScanner";

interface BarcodeScannerProps {
  onDetected: (value: string, codeType: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const { error, scanning } = useBarcodeScanner({
    onDetected,
    containerRef: scannerContainerRef
  });

  return (
    <div className="relative w-full h-64 bg-black">
      {error ? (
        <ErrorDisplay error={error} />
      ) : (
        <div 
          ref={scannerContainerRef} 
          className="w-full h-full"
        >
          {/* Html5QrCode will render the scanner here */}
        </div>
      )}
      <ScannerOverlay scanning={scanning} />
    </div>
  );
};

export default BarcodeScanner;
