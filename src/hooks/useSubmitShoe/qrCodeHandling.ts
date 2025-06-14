
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
  
  // Try to save QR code to database - but don't fail the entire submission if this fails
  try {
    logStep("Attempting to save QR code to database");
    await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    logStep("QR code successfully saved to database");
    toast.success("QR code generated and saved successfully!");
  } catch (error: any) {
    logStep("QR code database save failed", { 
      error: error.message,
      errorStack: error.stack,
      shoeId,
      qrCodeLength: qrCodeDataURL.length 
    });
    console.error("QR code save error:", error);
    toast.error(`QR code generated but database save failed: ${error.message}`);
    // Don't re-throw here - we still want to show the QR code even if saving failed
  }
  
  return qrCodeDataURL;
};
