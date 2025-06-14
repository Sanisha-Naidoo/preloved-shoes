
export interface UseSubmitShoeOptions {
  maxRetries?: number;
  onSuccess?: () => void;
}

export interface SubmissionState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  retryCount: number;
  submissionId: string | null;
  qrCodeUrl: string | null;
}

export interface SubmissionRefs {
  isSubmittingRef: React.MutableRefObject<boolean>;
  isMounted: React.MutableRefObject<boolean>;
  retryTimeoutRef: React.MutableRefObject<number | null>;
  hasAttemptedSubmission: React.MutableRefObject<boolean>;
}
