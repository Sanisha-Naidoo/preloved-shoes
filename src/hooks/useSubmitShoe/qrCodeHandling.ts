
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";
import { toast } from "sonner";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string> => {
  console.log("=== QR CODE GENERATION PROCESS START ===");
  console.log("🚀 Starting QR code generation for shoe:", {
    shoeId,
    shoeIdType: typeof shoeId,
    shoeIdValid: !!shoeId && shoeId.length > 0,
    timestamp: new Date().toISOString()
  });
  
  if (!shoeId || shoeId.trim() === '') {
    const error = "❌ Invalid shoe ID provided for QR generation";
    console.error(error, { providedShoeId: shoeId });
    throw new Error("Valid shoe ID is required for QR code generation");
  }
  
  try {
    // Step 1: Generate QR data
    console.log("📝 Step 1: Generating QR data...");
    const qrData = generateShoeQRData(shoeId);
    console.log("✅ QR data generated:", {
      qrData,
      dataLength: qrData.length,
      containsShoeId: qrData.includes(shoeId)
    });
    
    // Step 2: Convert to QR image
    console.log("🖼️ Step 2: Converting to QR image...");
    const qrCodeDataURL = await generateQRCode(qrData);
    console.log("✅ QR image generated:", {
      imageLength: qrCodeDataURL.length,
      isDataURL: qrCodeDataURL.startsWith('data:image'),
      imageType: qrCodeDataURL.substring(0, 30)
    });
    
    // Step 3: Update UI immediately
    console.log("💻 Step 3: Updating UI state...");
    if (setState && setState.setQrCodeUrl) {
      setState.setQrCodeUrl(qrCodeDataURL);
      console.log("✅ QR code set in UI state");
    } else {
      console.warn("⚠️ setState or setQrCodeUrl not available");
    }
    
    // Step 4: Save to database (CRITICAL STEP)
    console.log("🗄️ Step 4: Saving QR code to database...");
    console.log("Database save parameters:", {
      shoeId,
      qrCodeLength: qrCodeDataURL.length,
      saveAttemptTime: new Date().toISOString()
    });
    
    const saveStart = Date.now();
    const saveResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    const saveDuration = Date.now() - saveStart;
    
    console.log("💾 Database save completed:", {
      result: saveResult,
      duration: `${saveDuration}ms`,
      success: saveResult === true
    });
    
    if (saveResult === true) {
      console.log("🎉 QR CODE GENERATION FULLY SUCCESSFUL");
      toast.success("QR code generated and saved successfully!");
    } else {
      console.error("❌ Database save returned unexpected result:", saveResult);
      toast.error("QR code generated but database save failed");
    }
    
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("=== QR CODE GENERATION FAILED ===");
    console.error("💥 Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      shoeId,
      timestamp: new Date().toISOString()
    });
    
    toast.error(`QR code generation failed: ${error.message}`);
    throw error;
  }
};
