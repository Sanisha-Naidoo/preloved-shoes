
import { useState, useRef } from "react";
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
  const submissionInProgress = useRef(false);

  const submitData = async () => {
    // Prevent multiple concurrent submissions
    if (isSubmitting || isSubmitted || submissionInProgress.current) {
      console.log("Submission already in progress or completed, skipping");
      return;
    }

    try {
      submissionInProgress.current = true;
      setIsSubmitting(true);
      setError(null);
      
      console.log("🚀 Starting submission process");
      
      // 1. Validate data
      const { shoeDetails, solePhoto } = validateRequiredData();
      const rating = sessionStorage.getItem("rating") ? parseInt(sessionStorage.getItem("rating")!) : null;
      validateImage(solePhoto);
      
      console.log("✅ Data validation successful");
      
      // 2. Upload image
      console.log("📸 Processing and uploading image...");
      const photoUrl = await processAndUploadImage(solePhoto);
      console.log("✅ Image upload successful:", photoUrl);
      
      // 3. Create shoe record
      console.log("💾 Creating shoe record...");
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

      console.log("✅ Shoe record created with ID:", shoeId);
      
      setSubmissionId(shoeId);
      setIsSubmitted(true);
      clearSessionData();
      toast.success("Submission successful!");
      
      console.log("🎉 Submission process completed successfully");
      
    } catch (error: any) {
      console.error("💥 Submission process failed:", error);
      setError(error.message || "Submission failed");
      toast.error(error.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
      submissionInProgress.current = false;
    }
  };

  return {
    isSubmitting,
    isSubmitted,
    submissionId,
    error,
    submitData,
    setIsSubmitted: (value: boolean) => {
      setIsSubmitted(value);
      if (!value) {
        // Reset submission tracking when resetting submission state
        submissionInProgress.current = false;
        setSubmissionId(null);
        setError(null);
      }
    }
  };
};
