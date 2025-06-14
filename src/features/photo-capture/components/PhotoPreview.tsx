
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PhotoPreviewProps {
  capturedImage: string;
  onRetake: () => void;
  onContinue: () => void;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  capturedImage,
  onRetake,
  onContinue
}) => {
  return (
    <div className="relative">
      <img src={capturedImage} alt="Captured sole" className="w-full h-64 object-contain" />
      <div className="absolute top-2 right-2">
        
      </div>
    </div>
  );
};
