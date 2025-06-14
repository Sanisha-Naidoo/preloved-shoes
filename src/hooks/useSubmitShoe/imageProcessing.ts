
import { dataURLtoFile } from "@/utils/imageUtils";
import { uploadFileWithRetry } from "@/utils/uploadUtils";
import { logStep } from "./submissionLogger";

export const processAndUploadImage = async (solePhoto: string): Promise<string> => {
  console.log("🖼️ IMAGE PROCESSING START", {
    dataLength: solePhoto?.length,
    startsWithData: solePhoto?.startsWith('data:'),
    preview: solePhoto?.substring(0, 50) + "..."
  });
  
  try {
    logStep("Preparing image for upload");
    console.log("Converting data URL to file...");
    
    const file = await dataURLtoFile(solePhoto, "sole_photo.jpg");
    console.log("File conversion successful:", {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
    console.log("Generated filename:", fileName);
    
    logStep("Starting file upload");
    console.log("Uploading file to Supabase...");
    
    const photoUrl = await uploadFileWithRetry(file, fileName);
    console.log("✅ Upload successful, URL:", photoUrl);
    
    logStep("File upload successful", { photoUrl });
    
    return photoUrl;
  } catch (error: any) {
    console.error("❌ IMAGE PROCESSING FAILED:", {
      error: error.message,
      stack: error.stack,
      dataLength: solePhoto?.length
    });
    throw error;
  }
};
