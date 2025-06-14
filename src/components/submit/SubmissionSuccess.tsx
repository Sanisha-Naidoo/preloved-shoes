
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, PlusCircle, ArrowRight, QrCode, Loader2 } from "lucide-react";
import { generateAndSaveQRCode } from "@/hooks/useSubmitShoe/qrCodeHandling";
import { toast } from "sonner";

interface SubmissionSuccessProps {
  onSubmitAnother: () => void;
  onFinish: () => void;
  submissionId?: string | null;
  qrCodeUrl?: string | null;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ 
  onSubmitAnother,
  onFinish,
  submissionId,
  qrCodeUrl: initialQrCodeUrl
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState(initialQrCodeUrl);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const handleGenerateQRCode = async () => {
    if (!submissionId) {
      toast.error("No submission ID available");
      return;
    }

    setIsGeneratingQR(true);
    try {
      console.log("🎯 Generating QR code for submission:", submissionId);
      const generatedQrCodeUrl = await generateAndSaveQRCode(submissionId, { setQrCodeUrl });
      setQrCodeUrl(generatedQrCodeUrl);
      toast.success("QR code generated successfully!");
    } catch (error: any) {
      console.error("❌ QR code generation failed:", error);
      toast.error("Failed to generate QR code: " + error.message);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleFinishWithQR = async () => {
    if (submissionId && !qrCodeUrl && !isGeneratingQR) {
      await handleGenerateQRCode();
    }
    onFinish();
  };

  const handleSubmitAnotherWithQR = async () => {
    if (submissionId && !qrCodeUrl && !isGeneratingQR) {
      await handleGenerateQRCode();
    }
    onSubmitAnother();
  };

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
      {qrCodeUrl ? (
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <QrCode className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600 font-medium">Your Shoe QR Code</span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <img 
              src={qrCodeUrl} 
              alt="Shoe QR Code" 
              className="w-48 h-48 mx-auto"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Scan this code to access your shoe information
          </p>
        </div>
      ) : submissionId ? (
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <QrCode className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600 font-medium">QR Code</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            <Button
              onClick={handleGenerateQRCode}
              disabled={isGeneratingQR}
              variant="outline"
              className="mb-2"
            >
              {isGeneratingQR ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating QR Code...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500">
              Click to generate your unique QR code
            </p>
          </div>
        </div>
      ) : null}
      
      {!submissionId && !qrCodeUrl && <div className="mb-8"></div>}

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={handleSubmitAnotherWithQR}
          className="flex items-center justify-center"
          disabled={isGeneratingQR}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Submit Another
        </Button>
        <Button 
          onClick={handleFinishWithQR}
          className="flex items-center justify-center"
          disabled={isGeneratingQR}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Finish
        </Button>
      </div>
    </div>
  );
};
