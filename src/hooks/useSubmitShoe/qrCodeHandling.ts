
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";
import { toast } from "sonner";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string> => {
  console.log("🚀 QR GENERATION START", { 
    shoeId, 
    timestamp: new Date().toISOString() 
  });
  
  if (!shoeId?.trim()) {
    throw new Error("Valid shoe ID required for QR generation");
  }
  
  try {
    // Generate QR data
    console.log("📝 Generating QR data...");
    const qrData = generateShoeQRData(shoeId);
    console.log("✅ QR data generated:", qrData);
    
    // Generate QR image
    console.log("🖼️ Generating QR image...");
    const qrCodeDataURL = await generateQRCode(qrData);
    console.log("✅ QR image generated successfully");
    
    if (!qrCodeDataURL) {
      throw new Error("QR code generation returned empty result");
    }
    
    // Update UI state
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(qrCodeDataURL);
      console.log("✅ UI state updated with QR code");
    }
    
    // Save to database
    console.log("🗄️ Saving QR code to database...");
    await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    console.log("✅ QR code saved to database successfully");
    
    toast.success("QR code generated and saved!");
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("💥 QR GENERATION FAILED:", {
      error: error.message,
      shoeId
    });
    
    // Don't fail the entire submission for QR issues
    toast.warning("QR code generation failed, but submission continued");
    throw error;
  }
};
