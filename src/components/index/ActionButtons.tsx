
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Camera, Send, Download } from "lucide-react";

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

  const handleSubmit = () => {
    console.log("Submit button clicked", { hasShoeDetails, hasSolePhoto, canSubmit });
    
    if (!hasShoeDetails || !hasSolePhoto) {
      if (!hasShoeDetails) {
        console.log("Missing shoe details");
        toast.error("Missing shoe details. Please enter your shoe details first.");
      } else if (!hasSolePhoto) {
        console.log("Missing photo");
        toast.error("Missing photo. Please take a photo of your shoe sole first.");
      }
      return;
    }
    
    console.log("Navigating to submit page");
    triggerHapticFeedback();
    navigate('/submit');
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
        variant={hasShoeDetails ? "outline" : "default"}
        className={`group w-full h-14 text-base font-semibold transition-all duration-500 ease-out button-premium ${
          hasShoeDetails 
            ? 'glass-effect text-gray-700 hover:bg-white/90 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-500/10' 
            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/30 border-0'
        } rounded-2xl`}
      >
        <div className="flex items-center justify-center gap-3">
          <div className={`transition-all duration-300 ${hasShoeDetails ? 'text-green-600' : 'text-white'}`}>
            <FileText className="h-5 w-5" />
          </div>
          <span className="tracking-tight">
            {hasShoeDetails ? 'Edit' : 'Enter'} Shoe Details
          </span>
          {hasShoeDetails && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </Button>

      {/* Secondary Action Button - Photo Capture */}
      {hasShoeDetails && (
        <Button 
          onClick={() => {
            console.log("Photo capture button clicked");
            triggerHapticFeedback();
            navigate('/photo-capture');
          }} 
          variant={hasSolePhoto ? "outline" : "default"}
          className={`group w-full h-14 text-base font-semibold transition-all duration-500 ease-out button-premium animate-scale-in ${
            hasSolePhoto 
              ? 'glass-effect text-gray-700 hover:bg-white/90 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-500/10' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30 border-0'
          } rounded-2xl`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className={`transition-all duration-300 ${hasSolePhoto ? 'text-blue-600' : 'text-white'}`}>
              <Camera className="h-5 w-5" />
            </div>
            <span className="tracking-tight">
              {hasSolePhoto ? 'Retake' : 'Take'} Sole Photo
            </span>
            {hasSolePhoto && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </Button>
      )}
      
      {/* Submit Button - Premium CTA */}
      {(hasShoeDetails || hasSolePhoto) && (
        <div className="pt-4 animate-scale-in">
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`group w-full h-16 text-lg font-bold transition-all duration-500 ease-out rounded-2xl button-premium ${
              canSubmit 
                ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white hover:from-green-700 hover:via-emerald-700 hover:to-green-800 hover:shadow-2xl hover:shadow-green-500/40 border-0 hover:scale-[1.02] active:scale-[0.98]' 
                : 'glass-effect text-gray-400 border border-gray-200/40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center gap-4">
              <div className={`transition-all duration-300 ${canSubmit ? 'text-white group-hover:scale-110' : 'text-gray-400'}`}>
                <Send className="h-6 w-6" />
              </div>
              <span className="tracking-tight">
                {canSubmit ? 'Submit for Review' : 'Complete All Steps to Submit'}
              </span>
              {canSubmit && (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>
            
            {/* Subtle shimmer effect for enabled state */}
            {canSubmit && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
            )}
          </Button>
        </div>
      )}
      
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
