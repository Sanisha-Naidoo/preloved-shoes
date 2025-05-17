
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";

interface PhotoPreviewProps {
  capturedImage: string;
  onRetake: () => void;
  onContinue: () => void;
  onApprove: () => void;
  isApproved: boolean;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  capturedImage,
  onRetake,
  onContinue,
  onApprove,
  isApproved,
}) => {
  // Function to handle both approve and continue in one click
  const handleApproveClick = () => {
    onApprove();
    onContinue();
  };

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
          className={`rounded-full h-8 w-8 p-0 ${isApproved ? "bg-green-700" : "bg-green-500 hover:bg-green-600"}`}
          onClick={handleApproveClick}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
