
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
    timestamp: new Date().toISOString(),
    shoeIdType: typeof shoeId,
    shoeIdValid: !!shoeId?.trim()
  });
  
  if (!shoeId?.trim()) {
    const error = new Error("Valid shoe ID required for QR generation");
    console.error("❌ Invalid shoe ID:", { shoeId });
    throw error;
  }
  
  try {
    // Step 1: Generate QR data (start with simpler, smaller data)
    console.log("📝 Step 1: Generating QR data...");
    const qrData = generateShoeQRData(shoeId);
    console.log("✅ QR data generated:", {
      qrData,
      length: qrData.length
    });
    
    // Step 2: Generate QR image with smaller settings for testing
    console.log("🖼️ Step 2: Generating QR image with smaller settings...");
    const qrCodeDataURL = await generateQRCode(qrData);
    
    console.log("✅ QR image generated:", {
      success: !!qrCodeDataURL,
      length: qrCodeDataURL?.length,
      isValidDataUrl: qrCodeDataURL?.startsWith('data:image/'),
      sizeInKB: Math.round(qrCodeDataURL?.length / 1024)
    });
    
    if (!qrCodeDataURL || !qrCodeDataURL.startsWith('data:image/')) {
      throw new Error("QR code generation returned invalid result");
    }
    
    // Step 3: Save to database - CRITICAL OPERATION (no silent failures)
    console.log("🗄️ Step 3: Saving QR code to database (CRITICAL)...");
    console.log("📊 QR data being saved:", {
      shoeId,
      qrDataLength: qrCodeDataURL.length,
      qrDataSizeKB: Math.round(qrCodeDataURL.length / 1024),
      qrDataPreview: qrCodeDataURL.substring(0, 100) + "..."
    });
    
    const saveResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    
    if (!saveResult) {
      throw new Error("Database save operation returned false - QR code not saved");
    }
    
    console.log("🎉 QR code saved to database successfully");
    
    // Step 4: Update UI state only after successful database save
    console.log("🎨 Step 4: Updating UI state...");
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(qrCodeDataURL);
      console.log("✅ UI state updated with QR code");
    }
    
    toast.success("QR code generated and saved successfully!");
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("💥 QR GENERATION/SAVE FAILED:", {
      error: error.message,
      stack: error.stack,
      shoeId,
      step: "Critical QR generation/save process"
    });
    
    // Clear UI state on any failure
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(null);
    }
    
    // Show specific error message to user
    toast.error(`QR code save failed: ${error.message}`);
    throw error; // Re-throw to fail the submission if QR save fails
  }
};
