
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validateRequiredData } from "@/utils/validationUtils";
import { dataURLtoFile } from "@/utils/imageUtils";
import { uploadFileWithRetry } from "@/utils/uploadUtils";
import { toast } from "@/components/ui/sonner";

interface UseSubmitShoeOptions {
  maxRetries?: number;
  onSuccess?: () => void;
}

export const useSubmitShoe = (options: UseSubmitShoeOptions = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = options.maxRetries || 3;

  const submitData = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate required data
      const { shoeDetails, solePhoto } = validateRequiredData();
      const rating = sessionStorage.getItem("rating") ? parseInt(sessionStorage.getItem("rating")!) : null;
      
      // 1. Prepare the image file
      console.log("Preparing image for upload...");
      const file = await dataURLtoFile(solePhoto, "sole_photo.jpg");
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
      
      // 2. Upload the image with retry mechanism
      console.log("Starting file upload with retry mechanism...");
      const photoUrl = await uploadFileWithRetry(file, fileName);
      console.log("File upload successful:", photoUrl);
      
      // 3. Save the shoe data to the shoes table
      console.log("Saving shoe data to database...");
      const { data: shoeData, error: shoeError } = await supabase
        .from("shoes")
        .insert([
          {
            brand: shoeDetails.brand,
            model: shoeDetails.model || null,
            size: shoeDetails.size,
            size_unit: shoeDetails.sizeUnit,
            condition: shoeDetails.condition,
            barcode: shoeDetails.barcode || null,
            rating: rating, // Store rating in the shoes table
            photo_url: photoUrl, // Store photo URL directly in the shoes table
          },
        ])
        .select();

      if (shoeError) {
        throw shoeError;
      }

      const shoeId = shoeData[0].id;
      
      // 4. Save the scan data to the scans table
      const { error: scanError } = await supabase
        .from("scans")
        .insert([
          {
            shoe_id: shoeId,
            sole_photo_url: photoUrl,
            rating: rating, // Keep storing rating in scans for backward compatibility
          },
        ]);

      if (scanError) {
        throw scanError;
      }

      // Clear session storage after successful submission
      console.log("Submission successful! Clearing session storage...");
      sessionStorage.removeItem("shoeDetails");
      sessionStorage.removeItem("solePhoto");
      sessionStorage.removeItem("rating");

      setIsSubmitted(true);
      toast.success("Submission successful!");
      
      if (options.onSuccess) {
        options.onSuccess();
      }
    } catch (error: any) {
      console.error("Error submitting data:", error);
      const errorMessage = error.message || "Failed to submit data. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If errors are related to missing data rather than network issues, 
      // don't retry automatically but guide the user
      if (errorMessage.includes("Missing") || errorMessage.includes("Invalid")) {
        // User guidance error - don't retry
      } else if (retryCount < MAX_RETRIES) {
        // Network or server error - retry with exponential backoff
        setRetryCount(count => count + 1);
        const timeout = Math.pow(2, retryCount) * 1000;
        toast.info(`Retrying in ${timeout/1000} seconds...`);
        setTimeout(() => {
          submitData();
        }, timeout);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [retryCount, MAX_RETRIES, options]);

  return {
    isSubmitting,
    isSubmitted,
    error,
    retryCount,
    MAX_RETRIES,
    submitData,
    setIsSubmitted,
  };
};
