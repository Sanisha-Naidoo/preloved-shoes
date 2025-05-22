
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, PlusCircle, ArrowRight } from "lucide-react";

interface SubmissionSuccessProps {
  onSubmitAnother: () => void;
  onFinish: () => void;
  submissionId?: string | null;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ 
  onSubmitAnother,
  onFinish,
  submissionId
}) => {
  return (
    <div>
      <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
      <p className="text-gray-600 mb-2">
        Your submission has been received successfully.
      </p>
      
      {submissionId && (
        <p className="text-xs text-gray-500 mb-8 p-2 bg-gray-50 rounded-md overflow-hidden text-ellipsis">
          Submission ID: {submissionId}
        </p>
      )}
      
      {!submissionId && <div className="mb-8"></div>}

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={onSubmitAnother}
          className="flex items-center justify-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Submit Another
        </Button>
        <Button 
          onClick={onFinish}
          className="flex items-center justify-center"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Finish
        </Button>
      </div>
    </div>
  );
};
