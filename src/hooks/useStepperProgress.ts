
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export const SUBMISSION_STEPS = [
  {
    id: "details",
    title: "Details",
    description: "Enter shoe information"
  },
  {
    id: "photo",
    title: "Photo",
    description: "Capture sole photo"
  },
  {
    id: "rating",
    title: "Rating",
    description: "Rate your experience"
  },
  {
    id: "submit",
    title: "Submit",
    description: "Final submission"
  }
];

export const useStepperProgress = () => {
  const location = useLocation();
  
  const currentStep = useMemo(() => {
    const path = location.pathname;
    
    switch (path) {
      case "/manual-entry":
        return 1;
      case "/photo-capture":
        return 2;
      case "/rating":
        return 3;
      case "/submit":
        return 4;
      default:
        return 1;
    }
  }, [location.pathname]);

  return {
    steps: SUBMISSION_STEPS,
    currentStep
  };
};
