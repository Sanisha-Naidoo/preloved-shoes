
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitShoe } from "@/hooks/useSubmitShoe";
import { SubmissionLoading } from "@/components/submit/SubmissionLoading";
import { SubmissionError } from "@/components/submit/SubmissionError";
import { SubmissionSuccess } from "@/components/submit/SubmissionSuccess";

const Submit = () => {
  const navigate = useNavigate();
  const { 
    isSubmitting, 
    isSubmitted, 
    error, 
    retryCount, 
    MAX_RETRIES, 
    submitData 
  } = useSubmitShoe();

  useEffect(() => {
    // Attempt to submit data when the component mounts
    submitData();
  }, [submitData]);

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
              />
            ) : (
              <SubmissionSuccess
                onSubmitAnother={handleAnotherSubmission}
                onFinish={handleFinish}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Submit;
