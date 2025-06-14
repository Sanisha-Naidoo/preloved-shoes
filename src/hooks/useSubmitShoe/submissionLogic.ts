
import { supabase } from "@/integrations/supabase/client";
import { validateRequiredData } from "@/utils/validationUtils";
import { dataURLtoFile, validateImage } from "@/utils/imageUtils";
import { uploadFileWithRetry } from "@/utils/uploadUtils";
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { toast } from "sonner";
import { logStep } from "./submissionLogger";
import { SubmissionState, SubmissionRefs, UseSubmitShoeOptions } from "./types";

export const executeSubmission = async (
  state: SubmissionState,
  setState: any,
  refs: SubmissionRefs,
  options: UseSubmitShoeOptions,
  MAX_RETRIES: number
) => {
  // Prevent multiple concurrent submissions
  if (refs.isSubmittingRef.current || state.isSubmitted || refs.hasAttemptedSubmission.current) {
    console.log("Submission already in progress or completed, skipping");
    return;
  }
  
  // Mark that we've attempted submission to prevent re-triggers
  refs.hasAttemptedSubmission.current = true;
  
  try {
    setState.setIsSubmitting(true);
    refs.isSubmittingRef.current = true;
    setState.setError(null);
    
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
    validateImage(solePhoto);
    
    // 3. Prepare the image file
    logStep("Preparing image for upload");
    const file = await dataURLtoFile(solePhoto, "sole_photo.jpg");
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
    
    // 4. Upload the image with retry mechanism
    logStep("Starting file upload");
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
          rating: rating,
          photo_url: photoUrl,
          sole_photo_url: photoUrl,
        },
      ])
      .select();

    if (shoeError) {
      logStep("Error saving shoe data", shoeError);
      throw shoeError;
    }

    logStep("Shoe data saved successfully", { shoeId: shoeData[0].id });
    const shoeId = shoeData[0].id;
    setState.setSubmissionId(shoeId);

    // 6. Generate QR code for the shoe
    logStep("Generating QR code for shoe");
    const qrData = generateShoeQRData(shoeId);
    const qrCodeDataURL = await generateQRCode(qrData);
    
    // Store QR code URL in state first
    setState.setQrCodeUrl(qrCodeDataURL);
    logStep("QR code generated successfully", { qrCodeLength: qrCodeDataURL.length });
    
    // 7. Update the shoe record with the QR code
    logStep("Updating shoe record with QR code");
    const { data: updatedShoe, error: qrUpdateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select();

    if (qrUpdateError) {
      logStep("Error updating shoe with QR code", {
        error: qrUpdateError,
        shoeId: shoeId,
        qrCodeLength: qrCodeDataURL.length
      });
      console.error("QR code database update failed:", qrUpdateError);
      toast.error("QR code could not be saved to database, but submission was successful");
    } else {
      logStep("QR code saved to database successfully", { updatedShoe });
      console.log("QR code successfully saved to database");
    }

    logStep("Submission completed successfully");
    
    // Clear session storage after successful submission
    sessionStorage.removeItem("shoeDetails");
    sessionStorage.removeItem("solePhoto");
    sessionStorage.removeItem("rating");

    setState.setIsSubmitted(true);
    toast.success("Submission successful!");
    
    if (options.onSuccess && refs.isMounted.current) {
      options.onSuccess();
    }
    
  } catch (error: any) {
    logStep("Error submitting data", error);
    const errorMessage = error.message || "Failed to submit data. Please try again.";
    
    if (refs.isMounted.current) {
      setState.setError(errorMessage);
      toast.error(errorMessage);
    }
    
    // Check if this is a user data error vs a retryable error
    const isUserDataError = 
      errorMessage.includes("Missing") || 
      errorMessage.includes("Invalid") || 
      errorMessage.includes("too large") ||
      errorMessage.includes("Permission denied") ||
      errorMessage.includes("bucket") ||
      errorMessage.includes("file type");
        
    // For user data errors, don't retry automatically
    if (isUserDataError) {
      logStep("User data error - manual intervention required", { errorMessage });
    } else if (state.retryCount < MAX_RETRIES && refs.isMounted.current) {
      // For network/server errors, schedule a retry
      const newRetryCount = state.retryCount + 1;
      setState.setRetryCount(newRetryCount);
      const timeout = Math.pow(2, state.retryCount) * 1000;
      
      logStep(`Scheduling retry ${newRetryCount}/${MAX_RETRIES} in ${timeout/1000} seconds`);
      toast.info(`Retrying in ${timeout/1000} seconds...`);
      
      // Clear any existing timeout
      if (refs.retryTimeoutRef.current) {
        clearTimeout(refs.retryTimeoutRef.current);
      }
      
      // Reset submission state for retry
      refs.hasAttemptedSubmission.current = false;
      
      // Schedule retry
      refs.retryTimeoutRef.current = window.setTimeout(() => {
        if (refs.isMounted.current) {
          logStep(`Executing scheduled retry ${newRetryCount}...`);
          executeSubmission(state, setState, refs, options, MAX_RETRIES);
        }
      }, timeout) as unknown as number;
    } else {
      logStep("Maximum retry attempts reached or component unmounted");
    }
  } finally {
    if (refs.isMounted.current) {
      setState.setIsSubmitting(false);
    }
    refs.isSubmittingRef.current = false;
  }
};
