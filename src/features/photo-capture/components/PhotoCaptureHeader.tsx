
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PhotoCaptureHeaderProps {
  onBack: () => void;
}

export const PhotoCaptureHeader: React.FC<PhotoCaptureHeaderProps> = ({ onBack }) => {
  return (
    <>
      <Button variant="ghost" className="mb-6" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Capture Sole Photo</h1>
        <p className="text-gray-600 mb-6">
          Take a clear photo of the sole of your shoe. Hold your phone about 30cm away for best results.
        </p>
      </div>
    </>
  );
};
