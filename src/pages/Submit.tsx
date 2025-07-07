
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
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col relative overflow-hidden p-4">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.3)_1px,_transparent_0)] bg-[length:32px_32px]"></div>
      {/* Ambient Background Shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-200/15 to-teal-200/15 rounded-full blur-3xl opacity-40"></div>
      <div className="max-w-md mx-auto mb-6 relative z-10">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl shadow-gray-500/10 rounded-3xl transition-all duration-500 ease-out hover:shadow-3xl hover:shadow-gray-500/15 hover:bg-white/80">
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
