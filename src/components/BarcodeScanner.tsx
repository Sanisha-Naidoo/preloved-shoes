
import React, { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/sonner";

interface BarcodeScannerProps {
  onDetected: (value: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Check if running on HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          setError("Camera access requires HTTPS. Please use a secure connection.");
          simulateBarcodeDetection();
          return;
        }

        // Check if mediaDevices API is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Your browser doesn't support camera access");
          simulateBarcodeDetection();
          return;
        }

        // Request camera with specific constraints for barcode scanning
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => {
              console.error("Error playing video:", e);
              simulateBarcodeDetection();
            });
          };
          
          // Mock barcode detection for demonstration purposes
          // In a real app, you would integrate with a proper barcode scanning library
          simulateBarcodeDetection();
        }
      } catch (error: any) {
        console.error("Error accessing camera:", error);
        
        if (error.name === "NotAllowedError") {
          setError("Camera access denied. Please enable permissions.");
        } else if (error.name === "NotFoundError") {
          setError("No camera found on your device.");
        } else {
          setError(`Camera error: ${error.message || "Unknown error"}`);
        }
        
        toast.error("Camera access failed. Using mock barcode.");
        simulateBarcodeDetection();
      }
    };

    const simulateBarcodeDetection = () => {
      // Simulate a barcode scan after 3 seconds
      setTimeout(() => {
        const mockBarcodeValue = "123456789012";
        onDetected(mockBarcodeValue);
      }, 3000);
    };

    startCamera();

    // Clean up when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onDetected]);

  return (
    <div className="relative w-full h-64 bg-black">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white p-4 text-center">
          <div>
            <p className="mb-2">{error}</p>
            <p className="text-sm text-gray-300">Using mock barcode scanner...</p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="border-2 border-white/50 m-8 rounded"></div>
        <div className="absolute w-full h-1 bg-red-500/70 animate-pulse"></div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
