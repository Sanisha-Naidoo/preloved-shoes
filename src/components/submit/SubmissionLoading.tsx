
import React from "react";

interface SubmissionLoadingProps {
  retryCount?: number;
  maxRetries?: number;
}

export const SubmissionLoading: React.FC<SubmissionLoadingProps> = ({ 
  retryCount = 0,
  maxRetries = 3
}) => {
  return (
    <div>
      <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold mb-4">Submitting...</h2>
      <p className="text-gray-600">
        Please wait while we process your submission.
        {retryCount > 0 && ` (Attempt ${retryCount + 1}/${maxRetries + 1})`}
      </p>
    </div>
  );
};
