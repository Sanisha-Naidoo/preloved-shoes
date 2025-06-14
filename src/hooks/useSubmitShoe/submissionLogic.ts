
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
    
    // 1. Validate required data
    const { shoeDetails, solePhoto, rating } = performValidation();
    
    // 2. Prepare and upload the image
    const photoUrl = await processAndUploadImage(solePhoto);
    
    // 3. Save the shoe data to the database
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
    
    setState.setSubmissionId(shoeId);

    // 4. Generate and save QR code
    await generateAndSaveQRCode(shoeId, setState);

    logStep("Submission completed successfully");
    
    // Clear session storage after successful submission
    clearSessionData();

    setState.setIsSubmitted(true);
    toast.success("Submission successful!");
    
    if (options.onSuccess && refs.isMounted.current) {
      options.onSuccess();
    }
    
  } catch (error: any) {
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
