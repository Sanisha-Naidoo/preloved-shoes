
import { validateRequiredData } from "@/utils/validationUtils";
import { validateImage } from "@/utils/imageUtils";
import { logStep } from "./submissionLogger";

export interface ValidationResult {
  shoeDetails: any;
  solePhoto: string | null;
  rating: number | null;
}

export const performValidation = (): ValidationResult => {
  logStep("Validating required data");
  const { shoeDetails, solePhoto } = validateRequiredData();
  const rating = sessionStorage.getItem("rating") ? parseInt(sessionStorage.getItem("rating")!) : null;
  
  logStep("Retrieved data from session storage", { 
    hasShoeDetails: !!shoeDetails, 
    hasSolePhoto: !!solePhoto,
    rating 
  });
  
  // Only validate image if photo is provided
  if (solePhoto) {
    logStep("Validating image");
    validateImage(solePhoto);
  } else {
    logStep("No photo provided - skipping image validation");
  }
  
  return { shoeDetails, solePhoto, rating };
};
