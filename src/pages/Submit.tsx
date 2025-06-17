
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useSimpleSubmit } from "@/hooks/useSimpleSubmit";
import { useStepperProgress } from "@/hooks/useStepperProgress";
import { Stepper } from "@/components/ui/stepper";
import { SubmissionLoading } from "@/components/submit/SubmissionLoading";
import { SubmissionError } from "@/components/submit/SubmissionError";
import { SubmissionSuccess } from "@/components/submit/SubmissionSuccess";
import { toast } from "sonner";

const Submit = () => {
  const navigate = useNavigate();
  const { steps, currentStep } = useStepperProgress();
  const hasAttemptedSubmission = useRef(false);
  
  const {
    isSubmitting,
    isSubmitted,
    submissionId,
    error,
    submitData,
    setIsSubmitted
  } = useSimpleSubmit();

  useEffect(() => {
    // Prevent multiple submission attempts
    if (hasAttemptedSubmission.current || isSubmitted || isSubmitting) {
      return;
    }

    // Check for missing shoe details (required)
    const shoeDetailsStr = sessionStorage.getItem("shoeDetails");
    
    if (!shoeDetailsStr) {
      toast.error("Missing shoe details. Please go back and complete the form.");
      return;
    }
    
    // Photo is now optional - don't block submission if missing
    console.log("Starting submission process - photo is optional");

    // Mark that we've attempted submission to prevent duplicates
    hasAttemptedSubmission.current = true;
    
    // Submit the data
    submitData();
  }, []); // Empty dependency array to run only once

  const handleRetry = () => {
    hasAttemptedSubmission.current = false;
    setIsSubmitted(false);
    submitData();
  };

  const handleAnotherSubmission = () => {
    navigate("/manual-entry");
  };

  const handleFinish = () => {
    navigate("/thank-you");
  };

  // Check if we have critical missing data AND haven't submitted yet
  const hasMissingCriticalData = !isSubmitted && !sessionStorage.getItem("shoeDetails");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4 flex flex-col">
      <div className="max-w-md mx-auto mb-6">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {isSubmitted ? (
              <SubmissionSuccess 
                onSubmitAnother={handleAnotherSubmission} 
                onFinish={handleFinish} 
                submissionId={submissionId} 
              />
            ) : error ? (
              <SubmissionError 
                error={error} 
                onRetry={handleRetry} 
              />
            ) : isSubmitting ? (
              <SubmissionLoading />
            ) : hasMissingCriticalData ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Cannot Submit</h2>
                <p className="text-gray-600 mb-6">
                  Please go back and complete the required shoe information.
                </p>
                <button 
                  onClick={() => navigate("/")} 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Go Back
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Submit;
