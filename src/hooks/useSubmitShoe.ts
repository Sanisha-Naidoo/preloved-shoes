
import { useCallback, useEffect } from "react";
import { UseSubmitShoeOptions } from "./useSubmitShoe/types";
import { useSubmissionState, useSubmissionRefs } from "./useSubmitShoe/submissionState";
import { executeSubmission } from "./useSubmitShoe/submissionLogic";
import { logStep } from "./useSubmitShoe/submissionLogger";

export const useSubmitShoe = (options: UseSubmitShoeOptions = {}) => {
  const { state, setState } = useSubmissionState();
  const refs = useSubmissionRefs();
  const MAX_RETRIES = options.maxRetries || 3;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      refs.isMounted.current = false;
      if (refs.retryTimeoutRef.current) {
        clearTimeout(refs.retryTimeoutRef.current);
        refs.retryTimeoutRef.current = null;
      }
    };
  }, []);

  // Main submission function
  const submitData = useCallback(async () => {
    await executeSubmission(state, setState, refs, options, MAX_RETRIES);
  }, [options, MAX_RETRIES, state.isSubmitted, state.retryCount]);

  // Manual retry function triggered by user action
  const manualRetry = useCallback(() => {
    logStep("Manual retry initiated");
    
    // Clear any pending automatic retries
    if (refs.retryTimeoutRef.current) {
      clearTimeout(refs.retryTimeoutRef.current);
      refs.retryTimeoutRef.current = null;
    }
    
    // Reset state for manual retry
    setState.setRetryCount(0);
    setState.setError(null);
    refs.hasAttemptedSubmission.current = false;
    
    // Start submission process again
    submitData();
  }, [submitData, setState, refs]);

  return {
    isSubmitting: state.isSubmitting,
    isSubmitted: state.isSubmitted,
    error: state.error,
    retryCount: state.retryCount,
    MAX_RETRIES,
    submitData,
    setIsSubmitted: setState.setIsSubmitted,
    submissionId: state.submissionId,
    qrCodeUrl: state.qrCodeUrl,
    manualRetry,
  };
};
