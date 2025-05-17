
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
      {/* Guide overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="border-2 border-white border-dashed rounded-lg w-4/5 h-4/5 flex items-center justify-center">
          <p className="text-white bg-black/50 px-3 py-1 rounded text-sm">
            Center the sole here
          </p>
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
