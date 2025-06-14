
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
      isValidDataUrl: qrCodeDataURL?.startsWith('data:image/')
    });
    
    if (!qrCodeDataURL || !qrCodeDataURL.startsWith('data:image/')) {
      throw new Error("QR code generation returned invalid result");
    }
    
    // Step 3: Update UI state immediately
    console.log("🎨 Step 3: Updating UI state...");
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(qrCodeDataURL);
      console.log("✅ UI state updated with QR code");
    }
    
    // Step 4: Save to database
    console.log("🗄️ Step 4: Saving QR code to database...");
    const saveResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    console.log("✅ Database save result:", { saveResult });
    
    if (!saveResult) {
      console.warn("⚠️ Database save returned false, but no error thrown");
      toast.warning("QR code generated but may not have saved properly");
    } else {
      console.log("🎉 QR code generation and save completed successfully");
      toast.success("QR code generated and saved!");
    }
    
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("💥 QR GENERATION FAILED:", {
      error: error.message,
      stack: error.stack,
      shoeId,
      step: "QR generation process"
    });
    
    // Clear any partial UI state
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(null);
    }
    
    // Show user-friendly error message
    toast.error("QR code generation failed. Please try again.");
    throw error;
  }
};
