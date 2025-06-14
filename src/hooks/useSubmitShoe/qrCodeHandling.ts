
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
    
    // Step 3: Update UI state immediately (don't wait for database save)
    console.log("🎨 Step 3: Updating UI state...");
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(qrCodeDataURL);
      console.log("✅ UI state updated with QR code");
    }
    
    // Step 4: Save to database (but don't fail if this fails)
    console.log("🗄️ Step 4: Saving QR code to database...");
    try {
      const saveResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
      console.log("✅ Database save result:", { saveResult });
      
      if (saveResult) {
        console.log("🎉 QR code saved to database successfully");
        toast.success("QR code generated and saved!");
      } else {
        console.warn("⚠️ Database save returned false, but QR code is still available");
        toast.success("QR code generated! (Database save may have failed)");
      }
    } catch (dbError: any) {
      console.error("❌ Database save failed, but QR code is still available:", {
        error: dbError.message,
        stack: dbError.stack
      });
      
      // Don't clear the QR code from UI if database save fails
      toast.success("QR code generated! (Database save failed)");
    }
    
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("💥 QR GENERATION FAILED:", {
      error: error.message,
      stack: error.stack,
      shoeId,
      step: "QR generation process"
    });
    
    // Only clear UI state if QR generation itself failed (not database save)
    if (setState?.setQrCodeUrl && !error.message.includes("Database")) {
      setState.setQrCodeUrl(null);
    }
    
    // Show user-friendly error message
    toast.error(`QR code generation failed: ${error.message}`);
    throw error;
  }
};
