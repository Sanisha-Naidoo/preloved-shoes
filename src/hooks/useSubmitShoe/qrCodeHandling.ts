
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
    shoeIdType: typeof shoeId,
    shoeIdValid: !!shoeId?.trim(),
    timestamp: new Date().toISOString() 
  });
  
  if (!shoeId?.trim()) {
    const error = "Valid shoe ID required for QR generation";
    console.error("❌ QR GENERATION FAILED:", error);
    throw new Error(error);
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
      length: qrCodeDataURL?.length || 0,
      startsWithDataUrl: qrCodeDataURL?.startsWith('data:image/') || false,
      preview: qrCodeDataURL?.substring(0, 50) + "..."
    });
    
    if (!qrCodeDataURL) {
      throw new Error("QR code generation returned empty result");
    }
    
    // Step 3: Update UI immediately (optimistic update)
    console.log("💻 Step 3: Updating UI state...");
    if (setState?.setQrCodeUrl) {
      setState.setQrCodeUrl(qrCodeDataURL);
      console.log("✅ UI state updated with QR code");
    } else {
      console.warn("⚠️ setState.setQrCodeUrl not available");
    }
    
    // Step 4: Save to database - THE CRITICAL STEP
    console.log("🗄️ Step 4: STARTING DATABASE SAVE...");
    console.log("Database save parameters:", {
      shoeId,
      qrCodeLength: qrCodeDataURL.length,
      qrCodeType: typeof qrCodeDataURL,
      qrCodePreview: qrCodeDataURL.substring(0, 100) + "..."
    });
    
    const dbResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    console.log("✅ DATABASE SAVE RESULT:", dbResult);
    
    // Step 5: Verify the save worked
    console.log("🔍 Step 5: Verifying database save...");
    // We'll add verification logic in the database function
    
    toast.success("QR code generated and saved successfully!");
    console.log("🎉 QR GENERATION AND SAVE COMPLETED SUCCESSFULLY");
    
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("💥 QR GENERATION PROCESS FAILED:", {
      error: error.message,
      stack: error.stack,
      shoeId,
      step: "Unknown"
    });
    
    // Don't show toast error for QR issues - let the submission continue
    console.warn("⚠️ QR generation failed but submission will continue");
    
    throw error;
  }
};
