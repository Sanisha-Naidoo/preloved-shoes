
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string> => {
  console.log("🚀 Starting QR code generation", { shoeId });
  
  if (!shoeId?.trim()) {
    throw new Error("Shoe ID is required for QR code generation");
  }
  
  try {
    // Step 1: Generate QR data
    console.log("📝 Generating QR data...");
    const qrData = generateShoeQRData(shoeId);
    
    // Step 2: Generate QR image
    console.log("🖼️ Generating QR image...");
    const qrCodeDataURL = await generateQRCode(qrData);
    
    // Step 3: Save to database
    console.log("💾 Saving QR code to database...");
    await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    
    // Step 4: Update UI state
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(qrCodeDataURL);
      console.log("✅ UI state updated with QR code");
    }
    
    console.log("🎉 QR code process completed successfully");
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("💥 QR code generation/save failed:", error);
    throw new Error(`QR code process failed: ${error.message}`);
  }
};
