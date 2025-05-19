
import { supabase } from "@/integrations/supabase/client";

const MAX_RETRIES = 3;

/**
 * Uploads a file to Supabase storage with retry mechanism
 * @param file The file to upload
 * @param fileName The name to use for the uploaded file
 * @param bucketName The storage bucket to upload to
 * @param retryAttempt Current retry attempt number
 * @returns A promise resolving to the file's public URL
 */
export const uploadFileWithRetry = async (
  file: File, 
  fileName: string, 
  bucketName: string = "sole_photos", 
  retryAttempt = 0
): Promise<string> => {
  try {
    console.log(`Uploading file (attempt ${retryAttempt + 1}/${MAX_RETRIES + 1})...`);
    
    // Attempt the upload
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error details:", uploadError);
      
      // Check if we should retry
      if (retryAttempt < MAX_RETRIES) {
        console.log(`Retrying upload (attempt ${retryAttempt + 2}/${MAX_RETRIES + 1})...`);
        // Wait exponentially longer between retries (1s, 2s, 4s)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryAttempt) * 1000));
        return uploadFileWithRetry(file, fileName, bucketName, retryAttempt + 1);
      }
      throw uploadError;
    }

    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Final upload error:", error);
    throw error;
  }
};
