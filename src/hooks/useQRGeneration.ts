
import { useState } from "react";
import { toast } from "sonner";
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "@/hooks/useSubmitShoe/databaseOperations";

export const useQRGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQR = async (shoeId: string) => {
    if (!shoeId || isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate QR code
      const qrData = generateShoeQRData(shoeId);
      const qrCodeDataURL = await generateQRCode(qrData);
      
      // Save to database
      await updateShoeWithQRCode(shoeId, qrCodeDataURL);
      
      setQrCodeUrl(qrCodeDataURL);
      toast.success("QR code generated successfully!");
      
    } catch (error: any) {
      console.error("QR generation failed:", error);
      setError(error.message);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    qrCodeUrl,
    error,
    generateQR,
    setQrCodeUrl
  };
};
