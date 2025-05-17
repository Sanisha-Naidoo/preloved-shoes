
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload } from "lucide-react";

interface CameraLoadingProps {
  onCancel: () => void;
  onManualCapture: () => void;
}

export const CameraLoading: React.FC<CameraLoadingProps> = ({ onCancel, onManualCapture }) => {
  return (
    <div className="flex items-center justify-center h-64 bg-slate-100">
      <div className="flex flex-col items-center gap-2">
        <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
        <p className="text-slate-500">Accessing camera...</p>
        <div className="flex flex-col gap-2 mt-2 w-full">
          <Button 
            variant="default" 
            size="sm" 
            onClick={onManualCapture}
            className="flex items-center"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Photo Instead
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
