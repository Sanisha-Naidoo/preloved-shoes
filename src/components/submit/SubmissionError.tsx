import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface SubmissionErrorProps {
  error: string;
  onRetry?: () => void;
}

export const SubmissionError: React.FC<SubmissionErrorProps> = ({ 
  error,
  onRetry
}) => {
  const navigate = useNavigate();
  
  // Determine if this is a network/technical error that can be retried
  const isRetryableError = error.includes("network") || 
                          error.includes("timeout") || 
                          error.includes("connection") ||
                          error.includes("server") ||
                          error.includes("failed to upload") ||
                          error.includes("database");
  
  return (
    <div>
      <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Technical Error</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      
      <p className="text-sm text-amber-600 mb-6">
        This appears to be a technical issue. Please try again.
      </p>
      
      <div className="space-y-4">
        {onRetry && isRetryableError && (
          <Button 
            onClick={onRetry} 
            className="w-full flex items-center justify-center"
            variant="default"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
        
        <Button 
          onClick={() => navigate("/")} 
          className="w-full flex items-center justify-center"
          variant="outline"
        >
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Button>
      </div>
    </div>
  );
};
