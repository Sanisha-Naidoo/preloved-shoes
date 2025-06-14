
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, PlusCircle, ArrowRight, QrCode, RefreshCw } from "lucide-react";

interface SubmissionSuccessProps {
  onSubmitAnother: () => void;
  onFinish: () => void;
  submissionId?: string | null;
  qrCodeUrl?: string | null;
  onGenerateQR?: () => void;
  isGeneratingQR?: boolean;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ 
  onSubmitAnother,
  onFinish,
  submissionId,
  qrCodeUrl,
  onGenerateQR,
  isGeneratingQR = false
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
        <p className="text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded-md overflow-hidden text-ellipsis">
          Submission ID: {submissionId}
        </p>
      )}

      {/* QR Code Section */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-3">
          <QrCode className="h-5 w-5 text-gray-600 mr-2" />
          <span className="text-sm text-gray-600 font-medium">Your Shoe QR Code</span>
        </div>
        
        {qrCodeUrl ? (
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <img 
              src={qrCodeUrl} 
              alt="Shoe QR Code" 
              className="w-48 h-48 mx-auto"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Scan this code to access your shoe information
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              Generate a QR code for easy access to your shoe record
            </p>
            {onGenerateQR && (
              <Button 
                onClick={onGenerateQR}
                disabled={isGeneratingQR}
                variant="outline"
                size="sm"
                className="flex items-center justify-center"
              >
                {isGeneratingQR ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

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
