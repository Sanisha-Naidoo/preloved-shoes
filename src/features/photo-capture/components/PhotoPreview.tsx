
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";

interface PhotoPreviewProps {
  capturedImage: string;
  onRetake: () => void;
  onContinue: () => void;
  onDelete: () => void;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  capturedImage,
  onRetake,
  onContinue,
  onDelete
}) => {
  return (
    <div className="relative">
      <img src={capturedImage} alt="Captured sole" className="w-full h-64 object-contain" />
      <div className="absolute top-2 right-2">
        <Button 
          onClick={onDelete}
          variant="destructive"
          size="icon"
          className="rounded-full h-8 w-8 bg-red-500 hover:bg-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
