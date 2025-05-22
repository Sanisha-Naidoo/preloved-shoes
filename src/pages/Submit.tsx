
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitShoe } from "@/hooks/useSubmitShoe";
import { SubmissionLoading } from "@/components/submit/SubmissionLoading";
import { SubmissionError } from "@/components/submit/SubmissionError";
import { SubmissionSuccess } from "@/components/submit/SubmissionSuccess";
import { toast } from "@/components/ui/sonner";

const Submit = () => {
  const navigate = useNavigate();
  const { 
    isSubmitting, 
    isSubmitted, 
    error, 
    retryCount, 
    MAX_RETRIES, 
    submitData,
    submissionId
  } = useSubmitShoe({
    onSuccess: () => {
      console.log("Submission was successful!");
    }
  });

  useEffect(() => {
    // Log key information when component mounts
    console.log("Submit component mounted");
    console.log("Session storage contains:", {
      hasShoeDetails: !!sessionStorage.getItem("shoeDetails"),
      hasSolePhoto: !!sessionStorage.getItem("solePhoto"),
      hasRating: !!sessionStorage.getItem("rating")
    });
    
    // Display warning if any required data is missing
    if (!sessionStorage.getItem("shoeDetails")) {
      toast.error("Missing shoe details. Please go back and complete the form.");
    } else if (!sessionStorage.getItem("solePhoto")) {
      toast.error("Missing shoe photo. Please go back and take a photo.");
    }
    
    // Attempt to submit data when the component mounts
    console.log("Attempting to submit data...");
    submitData();
  }, [submitData]);
  
  const handleRetry = () => {
    console.log("Manual retry requested");
    submitData();
  };

  const handleAnotherSubmission = () => {
    navigate("/");
  };

  const handleFinish = () => {
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {isSubmitting ? (
              <SubmissionLoading 
                retryCount={retryCount} 
                maxRetries={MAX_RETRIES} 
              />
            ) : error ? (
              <SubmissionError 
                error={error} 
                retryCount={retryCount} 
                maxRetries={MAX_RETRIES} 
                onRetry={handleRetry}
              />
            ) : (
              <SubmissionSuccess
                onSubmitAnother={handleAnotherSubmission}
                onFinish={handleFinish}
                submissionId={submissionId}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Submit;
