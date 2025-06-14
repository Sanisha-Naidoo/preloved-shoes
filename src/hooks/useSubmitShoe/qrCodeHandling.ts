
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";
import { toast } from "sonner";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string> => {
  console.log("🚀 QR GENERATION START (REQUIRED)", { 
    shoeId, 
    timestamp: new Date().toISOString(),
    shoeIdType: typeof shoeId,
    shoeIdValid: !!shoeId?.trim()
  });
  
  if (!shoeId?.trim()) {
    throw new Error("Shoe ID is required for QR code generation");
  }
  
  // Step 1: Generate QR data
  console.log("📝 Step 1: Generating QR data...");
  const qrData = generateShoeQRData(shoeId);
  console.log("✅ QR data generated:", {
    qrData,
    length: qrData.length
  });
  
  // Step 2: Generate QR image
  console.log("🖼️ Step 2: Generating QR image...");
  const qrCodeDataURL = await generateQRCode(qrData);
  
  console.log("✅ QR image generated:", {
    success: !!qrCodeDataURL,
    length: qrCodeDataURL?.length,
    isValidDataUrl: qrCodeDataURL?.startsWith('data:image/'),
    sizeInKB: Math.round(qrCodeDataURL?.length / 1024)
  });
  
  if (!qrCodeDataURL || !qrCodeDataURL.startsWith('data:image/')) {
    throw new Error("QR code generation failed - invalid result");
  }
  
  // Step 3: Save to database (REQUIRED)
  console.log("🗄️ Step 3: Saving QR code to database (REQUIRED)...");
  
  const saveResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
  
  if (!saveResult) {
    throw new Error("QR code database save failed - submission cannot continue");
  }
  
  console.log("🎉 QR code saved to database successfully");
  
  // Update UI state after successful database save
  if (setState?.setQrCodeUrl) {
    setState.setQrCodeUrl(qrCodeDataURL);
    console.log("✅ UI state updated with QR code");
  }
  
  return qrCodeDataURL;
};
