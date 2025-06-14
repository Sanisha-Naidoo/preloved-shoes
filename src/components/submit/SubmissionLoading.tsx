
import React from "react";

export const SubmissionLoading: React.FC = () => {
  return (
    <div>
      <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold mb-4">Submitting...</h2>
      <p className="text-gray-600 mb-2">
        Processing your submission.
      </p>
      <p className="text-sm text-gray-500">
        Please wait while we save your shoe data.
      </p>
    </div>
  );
};
