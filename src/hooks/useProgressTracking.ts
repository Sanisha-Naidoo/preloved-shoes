
import { useState, useEffect } from "react";

export const useProgressTracking = () => {
  const [hasShoeDetails, setHasShoeDetails] = useState(false);
  const [hasSolePhoto, setHasSolePhoto] = useState(false);
  
  // Check completion status on mount and when returning to page
  useEffect(() => {
    const checkCompletionStatus = () => {
      const shoeDetails = sessionStorage.getItem("shoeDetails");
      const solePhoto = sessionStorage.getItem("solePhoto");
      
      console.log("Raw session storage data:", { shoeDetails, solePhoto });
      
      const hasDetails = !!shoeDetails;
      const hasPhoto = !!solePhoto;
      
      setHasShoeDetails(hasDetails);
      setHasSolePhoto(hasPhoto);
      
      console.log("Progress tracking status updated:", {
        hasShoeDetails: hasDetails,
        hasSolePhoto: hasPhoto,
        canSubmit: hasDetails && hasPhoto
      });
    };

    checkCompletionStatus();
    
    // Check status when user returns to the page (in case they used browser back button)
    const handleFocus = () => {
      console.log("Window focus event - rechecking completion status");
      checkCompletionStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const canSubmit = hasShoeDetails && hasSolePhoto;
  
  console.log("useProgressTracking returning:", {
    hasShoeDetails,
    hasSolePhoto,
    canSubmit
  });

  return {
    hasShoeDetails,
    hasSolePhoto,
    canSubmit
  };
};
