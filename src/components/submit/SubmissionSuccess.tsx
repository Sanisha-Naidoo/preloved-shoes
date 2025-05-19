
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SubmissionSuccessProps {
  onSubmitAnother: () => void;
  onFinish: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ 
  onSubmitAnother,
  onFinish
}) => {
  return (
    <div>
      <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg
          className="h-12 w-12 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
      <p className="text-gray-600 mb-8">
        Your submission has been received successfully.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={onSubmitAnother}>
          Submit Another Shoe
        </Button>
        <Button onClick={onFinish}>
          Finish
        </Button>
      </div>
    </div>
  );
};
