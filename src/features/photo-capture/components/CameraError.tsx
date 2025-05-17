
import React from "react";
import { Button } from "@/components/ui/button";
import { CameraOff } from "lucide-react";

interface CameraErrorProps {
  errorMessage: string;
  onRetry: () => void;
  onUsePlaceholder: () => void;
}

export const CameraError: React.FC<CameraErrorProps> = ({
  errorMessage,
  onRetry,
  onUsePlaceholder,
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
          onClick={onUsePlaceholder} 
          variant="outline" 
          className="w-full"
        >
          Use Placeholder Image
        </Button>
      </div>
    </div>
  );
};
