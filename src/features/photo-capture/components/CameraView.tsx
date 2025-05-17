
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapture: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ videoRef, onCapture }) => {
  return (
    <div className="relative">
      {/* Guide overlay - moved text to top */}
      <div className="absolute inset-0 flex flex-col items-center">
        {/* Text now positioned at top with padding */}
        <div className="mt-4 text-white bg-black/50 px-3 py-1 rounded text-sm">
          Center the sole here
        </div>
        {/* Dashed border guide remains centered */}
        <div className="border-2 border-white border-dashed rounded-lg w-4/5 h-4/5 mt-auto mb-auto">
        </div>
      </div>
      {/* Capture button */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <Button 
          onClick={onCapture} 
          className="rounded-full h-14 w-14 p-0 flex items-center justify-center"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
