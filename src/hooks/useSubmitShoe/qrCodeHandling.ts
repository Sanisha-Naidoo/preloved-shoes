
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";
import { updateShoeWithQRCode } from "./databaseOperations";
import { logStep } from "./submissionLogger";
import { toast } from "sonner";

export const generateAndSaveQRCode = async (
  shoeId: string,
  setState: any
): Promise<string> => {
  console.log("Generating QR code for shoe ID:", shoeId);
  
  try {
    // Generate the QR data and image
    const qrData = generateShoeQRData(shoeId);
    const qrCodeDataURL = await generateQRCode(qrData);
    
    console.log("QR code generated successfully");
    
    // Store in state immediately so user can see it
    setState.setQrCodeUrl(qrCodeDataURL);
    
    // Try to save to database, but don't fail submission if this fails
    try {
      await updateShoeWithQRCode(shoeId, qrCodeDataURL);
      console.log("QR code saved to database successfully");
      toast.success("QR code generated and saved!");
    } catch (saveError: any) {
      console.error("Failed to save QR code to database:", saveError);
      toast.error("QR code generated but not saved to database");
      // Don't throw - let submission continue
    }
    
    return qrCodeDataURL;
    
  } catch (error: any) {
    console.error("Error generating QR code:", error);
    toast.error("Failed to generate QR code");
    
    // Don't throw - let submission continue without QR code
    return "";
  }
};
