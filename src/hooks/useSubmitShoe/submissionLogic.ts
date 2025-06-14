
import { toast } from "sonner";
import { logStep } from "./submissionLogger";
import { SubmissionState, SubmissionRefs, UseSubmitShoeOptions } from "./types";
import { performValidation } from "./validation";
import { processAndUploadImage } from "./imageProcessing";
import { createShoeRecord } from "./databaseOperations";
import { handleSubmissionError } from "./errorHandling";
import { clearSessionData } from "./sessionCleanup";
import { generateAndSaveQRCode } from "./qrCodeHandling";

export const executeSubmission = async (
  state,
  setState,
  refs,
  options,
  MAX_RETRIES
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
    
    setState.setSubmissionId(shoeId);

    // Wait for database consistency
    console.log("⏳ Step 4: Waiting for database consistency...");
    await new Promise(res => setTimeout(res, 3000)); // Increased to 3 seconds

    // Generate QR code - make this optional to not fail the whole submission
    console.log("🔄 Step 5: Generating QR code...");
    try {
      const qrCodeDataURL = await generateAndSaveQRCode(shoeId, setState);
      setState.setQrCodeUrl(qrCodeDataURL);
      console.log("✅ QR code generated and saved successfully");
      toast.success("Submission successful! Your QR code has been generated.");
    } catch (qrError: any) {
      console.error("⚠️ QR code generation failed:", qrError);
      toast.warning("Submission successful, but QR code generation failed. The QR code will be generated when you access your shoe record.");
    }

    setState.setIsSubmitted(true);
    console.log("🎉 SUBMISSION PROCESS COMPLETED");

    console.log("🧹 Step 6: Cleaning up session data...");
    logStep("Submission completed successfully");
    
    // Clear session storage after successful submission
    clearSessionData();
    
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
