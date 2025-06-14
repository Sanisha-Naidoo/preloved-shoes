
import { logStep } from "./submissionLogger";
import { SubmissionState, SubmissionRefs, UseSubmitShoeOptions } from "./types";
import { toast } from "sonner";

export const handleSubmissionError = (
  error: any,
  state: SubmissionState,
  setState: any,
  refs: SubmissionRefs,
  options: UseSubmitShoeOptions,
  MAX_RETRIES: number,
  executeSubmission: Function
) => {
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
        executeSubmission();
      }
    }, timeout) as unknown as number;
  } else {
    logStep("Maximum retry attempts reached or component unmounted");
  }
};
