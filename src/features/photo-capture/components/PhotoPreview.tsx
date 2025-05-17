
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";

interface PhotoPreviewProps {
  capturedImage: string;
  onRetake: () => void;
  onContinue: () => void;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  capturedImage,
  onRetake,
  onContinue,
}) => {
  return (
    <div className="relative">
      <img src={capturedImage} alt="Captured sole" className="w-full h-64 object-contain" />
      <div className="absolute top-2 right-2">
        <Button 
          size="sm" 
          variant="secondary" 
          className="rounded-full h-8 w-8 p-0"
          onClick={onRetake}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute bottom-2 right-2">
        <Button 
          size="sm" 
          variant="default" 
          className="rounded-full h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
          onClick={onContinue}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
