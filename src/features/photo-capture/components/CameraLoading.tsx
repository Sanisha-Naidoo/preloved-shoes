
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CameraLoadingProps {
  onCancel: () => void;
}

export const CameraLoading: React.FC<CameraLoadingProps> = ({ onCancel }) => {
  return (
    <div className="flex items-center justify-center h-64 bg-slate-100">
      <div className="flex flex-col items-center gap-2">
        <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
        <p className="text-slate-500">Accessing camera...</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          className="mt-2"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
