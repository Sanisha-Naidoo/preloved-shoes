
import { useState, useEffect } from "react";

export const useProgressTracking = () => {
  const [hasShoeDetails, setHasShoeDetails] = useState(false);
  const [hasSolePhoto, setHasSolePhoto] = useState(false);
  
  // Check completion status on mount and when returning to page
  useEffect(() => {
    const checkCompletionStatus = () => {
      const shoeDetails = sessionStorage.getItem("shoeDetails");
      const solePhoto = sessionStorage.getItem("solePhoto");
      
      setHasShoeDetails(!!shoeDetails);
      setHasSolePhoto(!!solePhoto);
      
      console.log("Completion status:", {
        hasShoeDetails: !!shoeDetails,
        hasSolePhoto: !!solePhoto
      });
    };

    checkCompletionStatus();
    
    // Check status when user returns to the page (in case they used browser back button)
    const handleFocus = () => checkCompletionStatus();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return {
    hasShoeDetails,
    hasSolePhoto,
    canSubmit: hasShoeDetails && hasSolePhoto
  };
};
