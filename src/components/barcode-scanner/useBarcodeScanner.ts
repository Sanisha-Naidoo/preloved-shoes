
import { useState, useEffect, RefObject } from 'react';
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "@/components/ui/sonner";
import { getCameraId, getScannerConfig, isQRCodeFormat } from './utils';

interface UseBarcodeScanner {
  onDetected: (value: string, codeType: string) => void;
  containerRef: RefObject<HTMLDivElement>;
}

export const useBarcodeScanner = ({ onDetected, containerRef }: UseBarcodeScanner) => {
  const [error, setError] = useState<string | null>(null);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(true);

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

  const startScanner = async () => {
    try {
      // Check if running on HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError("Camera access requires HTTPS. Please use a secure connection.");
        useFallback();
        return;
      }

      if (!containerRef.current) {
        setError("Scanner container not found");
        useFallback();
        return;
      }

      const scannerId = "html5-qrcode-scanner";
      // Create scanner container if it doesn't exist
      let container = document.getElementById(scannerId);
      if (!container) {
        container = document.createElement("div");
        container.id = scannerId;
        container.style.width = "100%";
        container.style.height = "100%";
        containerRef.current.appendChild(container);
      }

      // Initialize HTML5 QR code scanner
      const html5QrCode = new Html5Qrcode(scannerId);
      setScanner(html5QrCode);

      const cameraId = await getCameraId();
      if (!cameraId) {
        setError("No camera found on your device.");
        useFallback();
        return;
      }

      await html5QrCode.start(
        cameraId,
        getScannerConfig(),
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

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    startScanner();

    // Clean up when component unmounts
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => console.error("Error stopping scanner on unmount:", err));
      }
    };
  }, [onDetected]);

  return { error, scanning, scanner };
};
