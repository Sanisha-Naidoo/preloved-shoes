
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";
import { toast } from "sonner";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string | null> => {
  console.log("🚀 QR GENERATION START", { 
    shoeId, 
    timestamp: new Date().toISOString(),
    shoeIdType: typeof shoeId,
    shoeIdValid: !!shoeId?.trim()
  });
  
  if (!shoeId?.trim()) {
    console.error("❌ Invalid shoe ID:", { shoeId });
    return null; // Return null instead of throwing
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
      isValidDataUrl: qrCodeDataURL?.startsWith('data:image/'),
      sizeInKB: Math.round(qrCodeDataURL?.length / 1024)
    });
    
    if (!qrCodeDataURL || !qrCodeDataURL.startsWith('data:image/')) {
      throw new Error("QR code generation returned invalid result");
    }
    
    // Step 3: Try to save to database (non-blocking)
    console.log("🗄️ Step 3: Attempting to save QR code to database...");
    
    try {
      const saveResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
      
      if (saveResult) {
        console.log("🎉 QR code saved to database successfully");
        
        // Update UI state only after successful database save
        if (setState?.setQrCodeUrl) {
          setState.setQrCodeUrl(qrCodeDataURL);
          console.log("✅ UI state updated with QR code");
        }
        
        toast.success("QR code generated successfully!");
        return qrCodeDataURL;
      } else {
        throw new Error("Database save returned false");
      }
    } catch (dbError: any) {
      console.error("⚠️ QR code database save failed, but continuing submission:", {
        error: dbError.message,
        shoeId
      });
      
      // Don't fail the entire submission - just log and continue
      toast.warning("QR code could not be saved, but your shoe was submitted successfully");
      return null;
    }
    
  } catch (error: any) {
    console.error("⚠️ QR GENERATION FAILED (non-blocking):", {
      error: error.message,
      stack: error.stack,
      shoeId,
      step: "QR generation process"
    });
    
    // Clear UI state on any failure
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(null);
    }
    
    // Show warning but don't fail submission
    toast.warning("QR code generation failed, but your shoe was submitted successfully");
    return null; // Return null instead of throwing
  }
};
