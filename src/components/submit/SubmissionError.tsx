
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface SubmissionErrorProps {
  error: string;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
}

export const SubmissionError: React.FC<SubmissionErrorProps> = ({ 
  error,
  retryCount = 0,
  maxRetries = 3,
  onRetry
}) => {
  const navigate = useNavigate();
  
  // Determine if we should show user-friendly guidance based on error type
  const isUserDataError = 
    error.includes("Missing") || 
    error.includes("Invalid") || 
    error.includes("too large");
  
  return (
    <div>
      <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Submission Error</h2>
      <p className="text-gray-600 mb-8">{error}</p>
      
      <div className="space-y-4">
        {onRetry && !isUserDataError && retryCount < maxRetries && (
          <Button 
            onClick={onRetry} 
            className="w-full flex items-center justify-center"
            variant="default"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Submission
          </Button>
        )}
        
        <Button 
          onClick={() => navigate("/")} 
          className="w-full flex items-center justify-center"
          variant={onRetry && !isUserDataError ? "outline" : "default"}
        >
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Button>
      </div>
    </div>
  );
};
