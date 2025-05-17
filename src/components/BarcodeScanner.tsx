
import React, { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onDetected: (value: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      setIsLoading(true);
      
      // Set a timeout for camera initialization
      timeoutRef.current = window.setTimeout(() => {
        if (isLoading) {
          setError("Camera access timed out. Using mock barcode scanner.");
          setIsLoading(false);
          simulateBarcodeDetection();
        }
      }, 10000); // 10 second timeout
      
      try {
        // Check if running on HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          setError("Camera access requires HTTPS. Please use a secure connection.");
          clearTimeout();
          setIsLoading(false);
          simulateBarcodeDetection();
          return;
        }

        // Check if mediaDevices API is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Your browser doesn't support camera access");
          clearTimeout();
          setIsLoading(false);
          simulateBarcodeDetection();
          return;
        }

        console.log("Requesting camera access for barcode scanner");
        // Request camera with specific constraints for barcode scanning
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        console.log("Camera access granted for barcode scanning");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => {
              console.error("Error playing video:", e);
              clearTimeout();
              setIsLoading(false);
              simulateBarcodeDetection();
            });
            
            clearTimeout();
            setIsLoading(false);
            
            // Mock barcode detection for demonstration purposes
            // In a real app, you would integrate with a proper barcode scanning library
            simulateBarcodeDetection();
          };
        } else {
          clearTimeout();
          setIsLoading(false);
          setError("Video element not available");
          simulateBarcodeDetection();
        }
      } catch (error: any) {
        console.error("Error accessing camera for barcode scanner:", error);
        
        if (error.name === "NotAllowedError") {
          setError("Camera access denied. Please enable permissions.");
        } else if (error.name === "NotFoundError") {
          setError("No camera found on your device.");
        } else {
          setError(`Camera error: ${error.message || "Unknown error"}`);
        }
        
        clearTimeout();
        setIsLoading(false);
        toast.error("Camera access failed. Using mock barcode.");
        simulateBarcodeDetection();
      }
    };

    const clearTimeout = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const simulateBarcodeDetection = () => {
      // Simulate a barcode scan after 2 seconds
      setTimeout(() => {
        const mockBarcodeValue = "123456789012";
        onDetected(mockBarcodeValue);
        toast.success("Barcode detected: " + mockBarcodeValue);
      }, 2000);
    };

    startCamera();

    // Clean up when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [onDetected]);

  return (
    <div className="relative w-full h-64 bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
          <Skeleton className="h-5 w-32 mb-4 bg-gray-700" />
          <Skeleton className="h-3 w-24 mb-1 bg-gray-800" />
          <Skeleton className="h-3 w-20 bg-gray-800" />
          <p className="text-sm text-gray-400 mt-4">Starting camera...</p>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white p-4 text-center">
          <div>
            <p className="mb-2">{error}</p>
            <p className="text-sm text-gray-300 mb-4">Using mock barcode scanner...</p>
            <Button 
              variant="secondary" 
              size="sm"
              className="mt-2" 
              onClick={() => {
                setError(null);
                const mockBarcodeValue = "123456789012";
                onDetected(mockBarcodeValue);
                toast.success("Using mock barcode: " + mockBarcodeValue);
              }}
            >
              Generate Mock Barcode
            </Button>
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
