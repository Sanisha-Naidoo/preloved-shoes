import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  
  // Add haptic feedback for mobile devices
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50ms
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
    <>
      {/* Action buttons */}
      <Button 
        onClick={() => {
          console.log("Shoe details button clicked");
          triggerHapticFeedback();
          navigate('/manual-entry');
        }} 
        variant={hasShoeDetails ? "outline" : "default"}
        className="w-full mb-4 h-14 text-base"
      >
        {hasShoeDetails ? 'Edit' : 'Enter'} Shoe Details
      </Button>

      {hasShoeDetails && (
        <Button 
          onClick={() => {
            console.log("Photo capture button clicked");
            triggerHapticFeedback();
            navigate('/photo-capture');
          }} 
          variant={hasSolePhoto ? "outline" : "default"}
          className="w-full mb-4 h-14 text-base"
        >
          {hasSolePhoto ? 'Retake' : 'Take'} Sole Photo
        </Button>
      )}
      
      {/* Submit button - only show when at least one step is complete */}
      {(hasShoeDetails || hasSolePhoto) && (
        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full h-14 text-base font-semibold"
          variant={canSubmit ? "default" : "secondary"}
        >
          {canSubmit ? 'Submit for Review' : 'Complete All Steps to Submit'}
        </Button>
      )}
      
      {/* Install button for PWA - hidden by default */}
      <Button 
        id="install-button"
        variant="outline" 
        className="w-full h-14 text-base mt-8 hidden"
      >
        Install App
      </Button>
    </>
  );
};
