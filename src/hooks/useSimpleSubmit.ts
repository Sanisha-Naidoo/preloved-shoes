
import { useState } from "react";
import { toast } from "sonner";
import { validateRequiredData } from "@/utils/validationUtils";
import { validateImage } from "@/utils/imageUtils";
import { processAndUploadImage } from "@/hooks/useSubmitShoe/imageProcessing";
import { createShoeRecord } from "@/hooks/useSubmitShoe/databaseOperations";
import { clearSessionData } from "@/hooks/useSubmitShoe/sessionCleanup";

export const useSimpleSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitData = async () => {
    if (isSubmitting || isSubmitted) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // 1. Validate data
      const { shoeDetails, solePhoto } = validateRequiredData();
      const rating = sessionStorage.getItem("rating") ? parseInt(sessionStorage.getItem("rating")!) : null;
      validateImage(solePhoto);
      
      // 2. Upload image
      const photoUrl = await processAndUploadImage(solePhoto);
      
      // 3. Create shoe record
      const { shoeId } = await createShoeRecord({
        brand: shoeDetails.brand,
        model: shoeDetails.model,
        size: shoeDetails.size,
        sizeUnit: shoeDetails.sizeUnit,
        condition: shoeDetails.condition,
        barcode: shoeDetails.barcode,
        rating,
        photoUrl
      });

      setSubmissionId(shoeId);
      setIsSubmitted(true);
      clearSessionData();
      toast.success("Submission successful!");
      
    } catch (error: any) {
      console.error("Submission failed:", error);
      setError(error.message || "Submission failed");
      toast.error(error.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    isSubmitted,
    submissionId,
    error,
    submitData,
    setIsSubmitted
  };
};
