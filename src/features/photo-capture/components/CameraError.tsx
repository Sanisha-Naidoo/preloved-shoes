
import React from "react";
import { Button } from "@/components/ui/button";
import { CameraOff, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CameraErrorProps {
  errorMessage: string;
  onRetry: () => void;
  onManualCapture: () => void;
}

export const CameraError: React.FC<CameraErrorProps> = ({
  errorMessage,
  onRetry,
  onManualCapture,
}) => {
  return (
    <div className="py-6 text-center">
      <CameraOff className="h-12 w-12 mx-auto mb-4 text-red-400" />
      
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
      
      <div className="space-y-3">
        <Button 
          onClick={onManualCapture} 
          variant="default" 
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" /> Upload Photo Instead
        </Button>
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="w-full"
        >
          Try Camera Again
        </Button>
      </div>
    </div>
  );
};
