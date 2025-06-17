
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useSimpleSubmit } from "@/hooks/useSimpleSubmit";
import { useStepperProgress } from "@/hooks/useStepperProgress";
import { Stepper } from "@/components/ui/stepper";
import { SubmissionLoading } from "@/components/submit/SubmissionLoading";
import { SubmissionError } from "@/components/submit/SubmissionError";
import { SubmissionSuccess } from "@/components/submit/SubmissionSuccess";

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
    // Check if user has completed required steps - if not, redirect back
    const shoeDetailsStr = sessionStorage.getItem("shoeDetails");
    
    if (!shoeDetailsStr) {
      // User hasn't completed required steps, redirect to start
      navigate("/manual-entry");
      return;
    }

    // Prevent multiple submission attempts
    if (hasAttemptedSubmission.current || isSubmitted || isSubmitting) {
      return;
    }

    console.log("Starting submission process");

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
            ) : (
              <SubmissionLoading />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Submit;
