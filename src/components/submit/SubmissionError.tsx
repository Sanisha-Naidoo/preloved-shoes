
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SubmissionErrorProps {
  error: string;
  retryCount?: number;
  maxRetries?: number;
}

export const SubmissionError: React.FC<SubmissionErrorProps> = ({ 
  error,
  retryCount = 0,
  maxRetries = 3
}) => {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <svg
          className="h-12 w-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-4">Submission Error</h2>
      <p className="text-gray-600 mb-8">{error}</p>
      <Button onClick={() => navigate("/")} className="w-full">
        Return Home
      </Button>
    </div>
  );
};
