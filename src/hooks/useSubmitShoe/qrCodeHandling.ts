
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";
import { toast } from "sonner";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string> => {
  logStep("Generating QR code for shoe");
  const qrData = generateShoeQRData(shoeId);
  logStep("QR data generated", { qrData, shoeId });
  
  const qrCodeDataURL = await generateQRCode(qrData);
  
  // Store QR code URL in state first
  setState.setQrCodeUrl(qrCodeDataURL);
  logStep("QR code generated successfully", { 
    qrCodeLength: qrCodeDataURL.length,
    qrCodePreview: qrCodeDataURL.substring(0, 100) + "...",
    qrData,
    startsWithDataUrl: qrCodeDataURL.startsWith('data:image/png;base64,')
  });
  
  try {
    // Update the shoe record with the QR code
    const updateSuccess = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    
    if (updateSuccess) {
      logStep("QR code successfully saved to database");
      toast.success("QR code generated and saved successfully!");
    } else {
      logStep("QR code update returned false");
      toast.error("QR code generated but could not be saved to database");
    }
  } catch (error: any) {
    logStep("QR code database save failed", { error: error.message });
    toast.error(`QR code generated but database save failed: ${error.message}`);
    // Don't throw here - we still want to show the QR code even if saving failed
  }
  
  return qrCodeDataURL;
};
