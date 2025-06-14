
import { useState, useRef } from "react";
import { SubmissionState, SubmissionRefs } from "./types";

export const useSubmissionState = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const state: SubmissionState = {
    isSubmitting,
    isSubmitted,
    error,
    retryCount,
    submissionId,
    qrCodeUrl,
  };

  const setState = {
    setIsSubmitting,
    setIsSubmitted,
    setError,
    setRetryCount,
    setSubmissionId,
    setQrCodeUrl,
  };

  return { state, setState };
};

export const useSubmissionRefs = (): SubmissionRefs => {
  const isSubmittingRef = useRef(false);
  const isMounted = useRef(true);
  const retryTimeoutRef = useRef<number | null>(null);
  const hasAttemptedSubmission = useRef(false);

  return {
    isSubmittingRef,
    isMounted,
    retryTimeoutRef,
    hasAttemptedSubmission,
  };
};
