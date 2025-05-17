
import React, { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, Barcode, AlertCircle } from "lucide-react";

interface BarcodeScannerProps {
  onDetected: (value: string, codeType: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    const scannerId = "html5-qrcode-scanner";

    const startScanner = async () => {
      try {
        // Check if running on HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          setError("Camera access requires HTTPS. Please use a secure connection.");
          useFallback();
          return;
        }

        if (!scannerContainerRef.current) {
          setError("Scanner container not found");
          useFallback();
          return;
        }

        // Create scanner container if it doesn't exist
        let container = document.getElementById(scannerId);
        if (!container) {
          container = document.createElement("div");
          container.id = scannerId;
          container.style.width = "100%";
          container.style.height = "100%";
          scannerContainerRef.current.appendChild(container);
        }

        // Initialize HTML5 QR code scanner
        html5QrCode = new Html5Qrcode(scannerId);
        setScanner(html5QrCode);

        const cameraId = await getCameraId();
        if (!cameraId) {
          setError("No camera found on your device.");
          useFallback();
          return;
        }

        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777778,
            // Changed from 'formats' to 'formatsToSupport'
            formatsToSupport: [
              // QR Code formats
              'QR_CODE', 'AZTEC', 'DATA_MATRIX',
              // Barcode formats 
              'CODE_39', 'CODE_93', 'CODE_128', 'EAN_8', 'EAN_13', 'UPC_A', 'UPC_E', 'ITF', 'RSS_14', 'RSS_EXPANDED'
            ]
          },
          (decodedText, decodedResult) => {
            // Successfully scanned code
            if (decodedText) {
              // Determine if it's a QR code or barcode based on format
              const formatName = decodedResult?.result?.format?.toString() || "unknown";
              const codeType = isQRCodeFormat(formatName) ? "qrcode" : "barcode";
              console.log(`Detected ${codeType}: ${decodedText}`);
              onBarcodeDetected(decodedText, codeType, html5QrCode);
            }
          },
          (errorMessage) => {
            // Scanning is ongoing, errors here are usually just frames without codes
          }
        );

        setScanning(true);
        toast.success("Scanner started", {
          id: "scanner-started",
        });
      } catch (error: any) {
        console.error("Error starting scanner:", error);
        
        if (error.name === "NotAllowedError") {
          setError("Camera access denied. Please enable permissions.");
        } else if (error.name === "NotFoundError") {
          setError("No camera found on your device.");
        } else {
          setError(`Camera error: ${error.message || "Unknown error"}`);
        }
        
        useFallback();
      }
    };

    const isQRCodeFormat = (format: string): boolean => {
      // QR code format names from the html5-qrcode library
      const qrFormats = ['QR_CODE', 'AZTEC', 'DATA_MATRIX'];
      return qrFormats.some(qrFormat => 
        format.toUpperCase().includes(qrFormat)
      );
    };

    const getCameraId = async (): Promise<string | null> => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          // Prefer back camera if available
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear')
          );
          return backCamera ? backCamera.id : devices[0].id;
        }
        return null;
      } catch (error) {
        console.error("Error getting cameras:", error);
        return null;
      }
    };

    const onBarcodeDetected = (decodedText: string, codeType: string, scanner: Html5Qrcode | null) => {
      // Stop scanning once code is detected
      setScanning(false);
      if (scanner) {
        scanner.stop().then(() => {
          console.log("Scanner stopped after detection");
          onDetected(decodedText, codeType);
        }).catch((err) => {
          console.error("Error stopping scanner:", err);
          // Still pass the detected code even if we couldn't stop the scanner
          onDetected(decodedText, codeType);
        });
      } else {
        onDetected(decodedText, codeType);
      }
    };

    const useFallback = () => {
      toast.error("Using mock code scanner", {
        id: "mock-scanner",
      });
      // Simulate a code scan after 2 seconds
      setTimeout(() => {
        // Use a fixed test code that matches a record in the database
        const testBarcode = "12345678901";
        onDetected(testBarcode, "barcode");
      }, 2000);
    };

    startScanner();

    // Clean up when component unmounts
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Error stopping scanner on unmount:", err));
      }
    };
  }, [onDetected]);

  return (
    <div className="relative w-full h-64 bg-black">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white p-4 text-center">
          <div>
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <p className="mb-2">{error}</p>
            <p className="text-sm text-gray-300">Using mock code scanner...</p>
          </div>
        </div>
      ) : (
        <div 
          ref={scannerContainerRef} 
          className="w-full h-full"
        >
          {/* Html5QrCode will render the scanner here */}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="border-2 border-white/50 m-8 rounded"></div>
        <div className="absolute w-full h-1 bg-red-500/70 animate-pulse"></div>
      </div>
      {scanning && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 flex items-center justify-center space-x-2">
          <QrCode className="h-4 w-4 text-white/70" />
          <Barcode className="h-4 w-4 text-white/70" />
          <p className="text-sm">
            Align the code within the scanner area
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
