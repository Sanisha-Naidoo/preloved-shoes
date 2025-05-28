import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitShoe } from "@/hooks/useSubmitShoe";
import { SubmissionLoading } from "@/components/submit/SubmissionLoading";
import { SubmissionError } from "@/components/submit/SubmissionError";
import { SubmissionSuccess } from "@/components/submit/SubmissionSuccess";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
const Submit = () => {
  const navigate = useNavigate();
  console.log("Submit component rendering");
  const {
    isSubmitting,
    isSubmitted,
    error,
    retryCount,
    MAX_RETRIES,
    submitData,
    submissionId,
    manualRetry
  } = useSubmitShoe({
    onSuccess: () => {
      console.log("Submission was successful!");
    }
  });
  useEffect(() => {
    console.log("Submit component mounted");
    console.log("Session storage contains:", {
      hasShoeDetails: !!sessionStorage.getItem("shoeDetails"),
      hasSolePhoto: !!sessionStorage.getItem("solePhoto"),
      hasRating: !!sessionStorage.getItem("rating")
    });

    // Check for missing data
    let missingData = false;
    if (!sessionStorage.getItem("shoeDetails")) {
      toast.error("Missing shoe details. Please go back and complete the form.");
      missingData = true;
    } else if (!sessionStorage.getItem("solePhoto")) {
      toast.error("Missing shoe photo. Please go back and take a photo.");
      missingData = true;
    }

    // Only attempt submission if we have the required data and haven't submitted yet
    if (!missingData && !isSubmitted && !isSubmitting) {
      console.log("Attempting to submit data...");
      submitData();
    }
  }, []); // Remove submitData from dependencies to prevent loops

  const handleRetry = () => {
    console.log("Manual retry requested");
    manualRetry();
  };
  const handleAnotherSubmission = () => {
    navigate("/");
  };
  const handleFinish = () => {
    navigate("/thank-you");
  };

  // Check if we have critical missing data that would prevent submission
  const hasMissingCriticalData = !sessionStorage.getItem("shoeDetails") || !sessionStorage.getItem("solePhoto");
  console.log("Submit component state:", {
    isSubmitting,
    isSubmitted,
    error,
    hasMissingCriticalData
  });
  return <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {hasMissingCriticalData}
            
            {isSubmitting ? <SubmissionLoading retryCount={retryCount} maxRetries={MAX_RETRIES} /> : error ? <SubmissionError error={error} retryCount={retryCount} maxRetries={MAX_RETRIES} onRetry={handleRetry} /> : isSubmitted ? <SubmissionSuccess onSubmitAnother={handleAnotherSubmission} onFinish={handleFinish} submissionId={submissionId} /> : hasMissingCriticalData ? <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Cannot Submit</h2>
                <p className="text-gray-600 mb-6">
                  Please go back and complete all required steps.
                </p>
                <button onClick={() => navigate("/")} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                  Go Back
                </button>
              </div> : null}
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Submit;