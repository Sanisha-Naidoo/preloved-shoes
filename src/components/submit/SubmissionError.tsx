
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home, ArrowLeft } from "lucide-react";

interface SubmissionErrorProps {
  error: string;
  onRetry?: () => void;
}

export const SubmissionError: React.FC<SubmissionErrorProps> = ({ 
  error,
  onRetry
}) => {
  const navigate = useNavigate();
  
  // Determine error category to provide appropriate guidance
  const isImageError = error.includes("photo") || error.includes("image") || error.includes("too large");
  const isMissingDataError = error.includes("Missing") || error.includes("required");
  
  // Determine where to navigate if user needs to go back
  const getBackNavigationPath = () => {
    if (isImageError) return "/photo-capture";
    if (isMissingDataError) return "/manual-entry";
    return "/";
  };
  
  return (
    <div>
      <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Submission Error</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      
      {/* Specific guidance based on error type */}
      {isImageError && (
        <p className="text-sm text-amber-600 mb-6">
          There was a problem with your shoe image. Please go back and try taking a new photo.
        </p>
      )}
      
      <div className="space-y-4">
        {onRetry && (
          <Button 
            onClick={onRetry} 
            className="w-full flex items-center justify-center"
            variant="default"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
        
        {(isMissingDataError || isImageError) && (
          <Button 
            onClick={() => navigate(getBackNavigationPath())} 
            className="w-full flex items-center justify-center"
            variant={onRetry ? "outline" : "default"}
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
