
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";
import { toast } from "sonner";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string> => {
  console.log("=== QR CODE GENERATION START ===");
  console.log("Generating QR code for shoe ID:", shoeId);
  
  try {
    // Generate the QR data and image
    const qrData = generateShoeQRData(shoeId);
    console.log("QR data generated:", qrData);
    
    const qrCodeDataURL = await generateQRCode(qrData);
    console.log("QR code image generated:", {
      length: qrCodeDataURL.length,
      preview: qrCodeDataURL.substring(0, 100) + "..."
    });
    
    // Store in state immediately so user can see it
    setState.setQrCodeUrl(qrCodeDataURL);
    console.log("QR code set in state");
    
    // Save to database - this is critical
    console.log("Attempting to save QR code to database...");
    const saveResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    console.log("Database save result:", saveResult);
    
    if (saveResult) {
      console.log("✅ QR code successfully saved to database");
      toast.success("QR code generated and saved!");
    } else {
      console.error("❌ Database save returned false");
      toast.error("QR code generated but failed to save to database");
    }
    
    console.log("=== QR CODE GENERATION END ===");
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("=== QR CODE GENERATION ERROR ===");
    console.error("Error generating or saving QR code:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    toast.error(`QR code failed: ${error.message}`);
    
    // Still return empty string so submission doesn't fail
    return "";
  }
};
