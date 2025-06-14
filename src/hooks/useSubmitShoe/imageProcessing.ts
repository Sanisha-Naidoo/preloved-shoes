
import { dataURLtoFile } from "@/utils/imageUtils";
import { uploadFileWithRetry } from "@/utils/uploadUtils";
import { logStep } from "./submissionLogger";

export const processAndUploadImage = async (solePhoto: string): Promise<string> => {
  logStep("Preparing image for upload");
  const file = await dataURLtoFile(solePhoto, "sole_photo.jpg");
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
  
  logStep("Starting file upload");
  const photoUrl = await uploadFileWithRetry(file, fileName);
  logStep("File upload successful", { photoUrl });
  
  return photoUrl;
};
