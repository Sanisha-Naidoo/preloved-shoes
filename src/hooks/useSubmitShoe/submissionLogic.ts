
import { toast } from "sonner";
import { logStep } from "./submissionLogger";
import { SubmissionState, SubmissionRefs, UseSubmitShoeOptions } from "./types";
import { performValidation } from "./validation";
import { processAndUploadImage } from "./imageProcessing";
import { createShoeRecord } from "./databaseOperations";
import { generateAndSaveQRCode } from "./qrCodeHandling";
import { handleSubmissionError } from "./errorHandling";
import { clearSessionData } from "./sessionCleanup";

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
    console.log("🚀 SUBMISSION PROCESS STARTED");
    
    // 1. Validate required data
    console.log("📋 Step 1: Validating data...");
    const { shoeDetails, solePhoto, rating } = performValidation();
    console.log("✅ Data validation successful");
    
    // 2. Prepare and upload the image
    console.log("📸 Step 2: Processing and uploading image...");
    const photoUrl = await processAndUploadImage(solePhoto);
    console.log("✅ Image upload successful:", photoUrl);
    
    // 3. Save the shoe data to the database
    console.log("💾 Step 3: Creating shoe record...");
    const shoeId = await createShoeRecord({
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
    
    setState.setSubmissionId(shoeId);

    // 4. Generate and save QR code
    console.log("🔍 Step 4: Starting QR code generation and save...");
    console.log("QR Code generation parameters:", {
      shoeId,
      shoeIdType: typeof shoeId,
      shoeIdLength: shoeId?.length,
      shoeIdValid: !!shoeId?.trim()
    });
    
    try {
      console.log("🎯 Initiating QR generation process...");
      const qrResult = await generateAndSaveQRCode(shoeId, setState);
      
      console.log("🎉 QR code process completed:", {
        resultType: typeof qrResult,
        resultLength: qrResult?.length || 0,
        resultValid: !!qrResult,
        resultPreview: qrResult?.substring(0, 50) + "..."
      });
      
      if (qrResult) {
        console.log("✅ QR code generation and database save successful");
      } else {
        console.warn("⚠️ QR code generation returned empty result but no error thrown");
      }
      
    } catch (qrError: any) {
      console.error("❌ QR code generation/save failed:", {
        message: qrError.message,
        stack: qrError.stack,
        name: qrError.name
      });
      
      // Log the error but don't fail the entire submission
      console.warn("⚠️ Continuing submission despite QR code failure");
      toast.warning("Shoe submitted successfully, but QR code generation failed");
    }

    console.log("🧹 Step 5: Cleaning up session data...");
    logStep("Submission completed successfully");
    
    // Clear session storage after successful submission
    clearSessionData();

    setState.setIsSubmitted(true);
    console.log("🎉 SUBMISSION PROCESS COMPLETED SUCCESSFULLY");
    toast.success("Submission successful!");
    
    if (options.onSuccess && refs.isMounted.current) {
      options.onSuccess();
    }
    
  } catch (error: any) {
    console.error("💥 SUBMISSION PROCESS FAILED:", {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    handleSubmissionError(
      error,
      state,
      setState,
      refs,
      options,
      MAX_RETRIES,
      () => executeSubmission(state, setState, refs, options, MAX_RETRIES)
    );
  } finally {
    if (refs.isMounted.current) {
      setState.setIsSubmitting(false);
    }
    refs.isSubmittingRef.current = false;
  }
};
