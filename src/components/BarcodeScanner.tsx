
import React, { useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";

interface BarcodeScannerProps {
  onDetected: (value: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Mock barcode detection for demonstration purposes
          // In a real app, you would integrate with a proper barcode scanning library
          setTimeout(() => {
            // Simulate a barcode scan after 3 seconds
            const mockBarcodeValue = "123456789012";
            onDetected(mockBarcodeValue);
          }, 3000);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast.error("Camera access denied. Please enable camera permissions.");
      }
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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 border-2 border-white/50 m-8 pointer-events-none"></div>
    </div>
  );
};

export default BarcodeScanner;
