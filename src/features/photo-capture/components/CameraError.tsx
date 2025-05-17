
import React from "react";
import { Button } from "@/components/ui/button";
import { CameraOff } from "lucide-react";

interface CameraErrorProps {
  errorMessage: string;
  onRetry: () => void;
  onManualCapture: () => void; // Changed prop name
}

export const CameraError: React.FC<CameraErrorProps> = ({
  errorMessage,
  onRetry,
  onManualCapture, // Changed prop name
}) => {
  return (
    <div className="py-8 text-center">
      <CameraOff className="h-12 w-12 mx-auto mb-4 text-red-400" />
      <p className="text-red-500 mb-4">{errorMessage}</p>
      <div className="space-y-3">
        <Button onClick={onRetry} className="w-full">
          Try Again
        </Button>
        <Button 
          onClick={onManualCapture} 
          variant="outline" 
          className="w-full"
        >
          Manual Capture
        </Button>
      </div>
    </div>
  );
};
