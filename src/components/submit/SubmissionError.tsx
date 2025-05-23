
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home, ArrowLeft } from "lucide-react";

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
  
  // Determine error category to provide appropriate guidance
  const isPermissionError = error.includes("Permission denied") || error.includes("bucket");
  const isMissingDataError = error.includes("Missing") || error.includes("required");
  const isImageError = error.includes("photo") || error.includes("image") || error.includes("too large");
  const isNetworkError = error.includes("network") || error.includes("connection");
  
  // Determine where to navigate if user needs to go back
  const getBackNavigationPath = () => {
    if (isImageError) return "/photo-capture";
    if (isMissingDataError) return "/manual-entry";
    return "/";
  };
  
  // Check if retry is possible/recommended
  const canRetry = onRetry && !isPermissionError && !isMissingDataError && retryCount < maxRetries;
  
  return (
    <div>
      <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Submission Error</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      
      {/* Specific guidance based on error type */}
      {isPermissionError && (
        <p className="text-sm text-amber-600 mb-6">
          This appears to be a permission issue with the storage system. Please try again later or contact support.
        </p>
      )}
      
      {isImageError && (
        <p className="text-sm text-amber-600 mb-6">
          There was a problem with your shoe image. Please go back and try taking a new photo.
        </p>
      )}
      
      {isNetworkError && (
        <p className="text-sm text-amber-600 mb-6">
          Please check your internet connection and try again.
        </p>
      )}
      
      <div className="space-y-4">
        {canRetry && (
          <Button 
            onClick={onRetry} 
            className="w-full flex items-center justify-center"
            variant="default"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Submission
          </Button>
        )}
        
        {(isMissingDataError || isImageError) && (
          <Button 
            onClick={() => navigate(getBackNavigationPath())} 
            className="w-full flex items-center justify-center"
            variant={canRetry ? "outline" : "default"}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back and Fix
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
