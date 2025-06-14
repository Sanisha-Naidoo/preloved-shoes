
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
    // Generate the QR data
    const qrData = generateShoeQRData(shoeId);
    console.log("QR data generated:", qrData);
    
    // Generate the QR code image
    const qrCodeDataURL = await generateQRCode(qrData);
    console.log("QR code image generated successfully");
    console.log("QR code length:", qrCodeDataURL.length);
    console.log("QR code type check:", typeof qrCodeDataURL);
    console.log("QR code starts correctly:", qrCodeDataURL.startsWith('data:image/png;base64,'));
    
    // Store in state immediately
    setState.setQrCodeUrl(qrCodeDataURL);
    console.log("QR code stored in state");
    
    // Now attempt to save to database
    console.log("Attempting to save QR code to database...");
    
    const saveResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
    
    if (saveResult) {
      console.log("QR code successfully saved to database!");
      toast.success("QR code generated and saved successfully!");
    } else {
      console.error("QR code save returned false");
      toast.error("QR code generated but database save returned false");
    }
    
    console.log("=== QR CODE GENERATION COMPLETE ===");
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("=== QR CODE GENERATION FAILED ===");
    console.error("Error during QR code generation/save:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Still show the QR code in UI even if database save failed
    toast.error(`QR code generated but save failed: ${error.message}`);
    
    // Return the QR code anyway so user can see it
    const qrData = generateShoeQRData(shoeId);
    const qrCodeDataURL = await generateQRCode(qrData);
    setState.setQrCodeUrl(qrCodeDataURL);
    
    throw error; // Re-throw so the submission logic knows there was an issue
  }
};
