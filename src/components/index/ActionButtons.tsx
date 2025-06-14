
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Camera, Send, Download, Footprints } from "lucide-react";

interface ActionButtonsProps {
  hasShoeDetails: boolean;
  hasSolePhoto: boolean;
  canSubmit: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  hasShoeDetails,
  hasSolePhoto,
  canSubmit
}) => {
  const navigate = useNavigate();
  
  console.log("ActionButtons render:", { hasShoeDetails, hasSolePhoto, canSubmit });
  
  // Enhanced haptic feedback for premium feel
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate([10, 5, 10]);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Primary Action Button - Shoe Details */}
      <Button 
        onClick={() => {
          console.log("Shoe details button clicked");
          triggerHapticFeedback();
          navigate('/manual-entry');
        }} 
        variant="default"
        className="group w-full h-14 text-base font-semibold transition-all duration-500 ease-out button-premium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/30 border-0 rounded-2xl"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="transition-all duration-300 text-white">
            <Footprints className="h-5 w-5" />
          </div>
          <span className="tracking-tight">
            Enter Shoe Details
          </span>
        </div>
      </Button>
      
      {/* PWA Install Button - Hidden by default */}
      <Button 
        id="install-button"
        variant="outline" 
        className="w-full h-14 text-base mt-8 hidden glass-effect text-gray-700 hover:bg-white/90 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-500/10 rounded-2xl button-premium"
      >
        <div className="flex items-center justify-center gap-3">
          <Download className="h-5 w-5" />
          <span className="tracking-tight font-semibold">Install App</span>
        </div>
      </Button>
    </div>
  );
};
