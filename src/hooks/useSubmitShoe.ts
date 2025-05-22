
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validateRequiredData } from "@/utils/validationUtils";
import { dataURLtoFile, validateImage } from "@/utils/imageUtils";
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
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const MAX_RETRIES = options.maxRetries || 3;

  // Check for service worker updates on component mount
  useEffect(() => {
    // Clear cache when mounting component
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = event => {
        if (event.data && event.data.success) {
          console.log('Cache cleared successfully');
        }
      };
      
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      }, [messageChannel.port2]);
    }
  }, []);

  // Function to log steps with timestamps
  const logStep = (step: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] ${step}:`, data);
    } else {
      console.log(`[${timestamp}] ${step}`);
    }
  };

  const submitData = useCallback(async () => {
    if (isSubmitted) {
      console.log("Submission already completed successfully, no need to resubmit");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      logStep("Starting submission process");
      
      // 1. Validate required data
      logStep("Validating required data");
      const { shoeDetails, solePhoto } = validateRequiredData();
      const rating = sessionStorage.getItem("rating") ? parseInt(sessionStorage.getItem("rating")!) : null;
      
      logStep("Retrieved data from session storage", { 
        hasShoeDetails: !!shoeDetails, 
        hasSolePhoto: !!solePhoto,
        rating 
      });
      
      // 2. Validate image before processing
      logStep("Validating image");
      try {
        validateImage(solePhoto);
      } catch (imageError: any) {
        throw imageError;
      }
      
      // 3. Prepare the image file
      logStep("Preparing image for upload");
      try {
        const file = await dataURLtoFile(solePhoto, "sole_photo.jpg");
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
        
        // 4. Upload the image with retry mechanism
        logStep("Starting file upload with retry mechanism");
        const photoUrl = await uploadFileWithRetry(file, fileName);
        logStep("File upload successful", { photoUrl });
        
        // 5. Save the shoe data to the shoes table
        logStep("Saving shoe data to database");
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
          logStep("Error saving shoe data", shoeError);
          throw shoeError;
        }

        logStep("Shoe data saved successfully", { shoeId: shoeData[0].id });
        const shoeId = shoeData[0].id;
        setSubmissionId(shoeId);
        
        // 6. Save the scan data to the scans table
        logStep("Saving scan data");
        const { error: scanError } = await supabase
          .from("scans")
          .insert([
            {
              shoe_id: shoeId,
              sole_photo_url: photoUrl,
              rating: rating,
            },
          ]);

        if (scanError) {
          logStep("Error saving scan data", scanError);
          throw scanError;
        }

        logStep("Submission completed successfully");
        
        // Clear session storage after successful submission
        sessionStorage.removeItem("shoeDetails");
        sessionStorage.removeItem("solePhoto");
        sessionStorage.removeItem("rating");

        setIsSubmitted(true);
        toast.success("Submission successful!");
        
        if (options.onSuccess) {
          options.onSuccess();
        }
      } catch (conversionError: any) {
        logStep("Image conversion error", conversionError);
        throw new Error(`Failed to process image: ${conversionError.message}`);
      }
    } catch (error: any) {
      logStep("Error submitting data", error);
      const errorMessage = error.message || "Failed to submit data. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If errors are related to missing data rather than network issues, 
      // don't retry automatically but guide the user
      const isUserDataError = 
        errorMessage.includes("Missing") || 
        errorMessage.includes("Invalid") || 
        errorMessage.includes("too large");
        
      if (isUserDataError) {
        // User guidance error - don't retry
        logStep("User data error - not retrying", { errorMessage });
      } else if (retryCount < MAX_RETRIES) {
        // Network or server error - retry with exponential backoff
        setRetryCount(count => count + 1);
        const timeout = Math.pow(2, retryCount) * 1000;
        logStep(`Retrying in ${timeout/1000} seconds...`);
        toast.info(`Retrying in ${timeout/1000} seconds...`);
        setTimeout(() => {
          submitData();
        }, timeout);
      } else {
        logStep("Maximum retry attempts reached");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [retryCount, MAX_RETRIES, options, isSubmitted]);

  return {
    isSubmitting,
    isSubmitted,
    error,
    retryCount,
    MAX_RETRIES,
    submitData,
    setIsSubmitted,
    submissionId,
  };
};
