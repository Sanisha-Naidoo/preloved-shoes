
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";
import { toast } from "sonner";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string> => {
  console.log("🚀 QR GENERATION START", { shoeId, timestamp: new Date().toISOString() });
  
  if (!shoeId?.trim()) {
    throw new Error("Valid shoe ID required for QR generation");
  }
  
  try {
    // Generate QR data
    const qrData = generateShoeQRData(shoeId);
    console.log("📝 QR data generated:", qrData);
    
    // Generate QR image
    const qrCodeDataURL = await generateQRCode(qrData);
    console.log("🖼️ QR image generated, length:", qrCodeDataURL.length);
    
    // Update UI immediately
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(qrCodeDataURL);
      console.log("💻 UI updated with QR code");
    }
    
    // Save to database - THIS IS THE CRITICAL STEP
    console.log("🗄️ STARTING DATABASE SAVE...");
    await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    console.log("✅ DATABASE SAVE COMPLETED");
    
    toast.success("QR code generated and saved!");
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("💥 QR GENERATION FAILED:", error.message);
    toast.error(`QR generation failed: ${error.message}`);
    throw error;
  }
};
