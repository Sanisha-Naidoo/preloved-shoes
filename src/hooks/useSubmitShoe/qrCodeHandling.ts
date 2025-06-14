
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";
import { toast } from "sonner";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string> => {
  console.log("=== QR CODE GENERATION START ===");
  console.log("Input validation:", {
    shoeId,
    shoeIdType: typeof shoeId,
    shoeIdValid: !!shoeId,
    setStateValid: !!setState
  });
  
  if (!shoeId) {
    console.error("❌ No shoe ID provided for QR generation");
    throw new Error("Shoe ID is required for QR code generation");
  }
  
  try {
    // Generate the QR data and image
    console.log("🔗 Generating QR data for shoe ID:", shoeId);
    const qrData = generateShoeQRData(shoeId);
    console.log("📊 QR data generated:", {
      qrData,
      dataLength: qrData.length,
      dataType: typeof qrData
    });
    
    console.log("🖼️ Converting QR data to image...");
    const qrCodeDataURL = await generateQRCode(qrData);
    console.log("✅ QR code image generated successfully:", {
      imageLength: qrCodeDataURL.length,
      imageType: typeof qrCodeDataURL,
      isDataURL: qrCodeDataURL.startsWith('data:image'),
      preview: qrCodeDataURL.substring(0, 50) + "..."
    });
    
    // Store in state immediately so user can see it
    console.log("💾 Setting QR code in component state...");
    setState.setQrCodeUrl(qrCodeDataURL);
    console.log("✅ QR code set in component state");
    
    // Save to database - this is critical
    console.log("🗄️ Attempting to save QR code to database...");
    console.log("Database save parameters:", {
      shoeId,
      qrCodeLength: qrCodeDataURL.length,
      timestamp: new Date().toISOString()
    });
    
    const saveResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    console.log("📋 Database save operation completed:", {
      saveResult,
      resultType: typeof saveResult,
      success: !!saveResult
    });
    
    if (saveResult) {
      console.log("✅ QR code successfully saved to database");
      toast.success("QR code generated and saved!");
    } else {
      console.error("❌ Database save returned false - operation failed");
      toast.error("QR code generated but failed to save to database");
    }
    
    console.log("=== QR CODE GENERATION END (SUCCESS) ===");
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("=== QR CODE GENERATION END (ERROR) ===");
    console.error("💥 Error in QR code generation:", error);
    console.error("Error analysis:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      timestamp: new Date().toISOString()
    });
    
    toast.error(`QR code failed: ${error.message}`);
    throw error; // Re-throw to let caller handle
  }
};
