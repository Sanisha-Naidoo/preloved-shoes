import { supabase } from "@/integrations/supabase/client";

const MAX_RETRIES = 3;

/**
 * Uploads a file to Supabase storage with retry mechanism and enhanced error reporting
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
    // Validate inputs
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file object provided for upload");
    }
    
    if (!fileName) {
      throw new Error("No file name provided for upload");
    }
    
    console.log(`Uploading file "${fileName}" (${file.size} bytes) to bucket "${bucketName}" (attempt ${retryAttempt + 1}/${MAX_RETRIES + 1})...`);
    
    // Removed bucket creation attempts since they require admin privileges
    // Just attempt the upload directly to the pre-existing bucket
    console.log(`Starting upload of "${fileName}" to bucket "${bucketName}"...`);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Overwrite if exists
      });

    if (uploadError) {
      console.error("Upload error details:", uploadError);
      console.error("Error message:", uploadError.message);
      
      // Check if we should retry - only for network/server errors, not permission issues
      const isPermissionError = uploadError.message.includes("permission") || 
                               uploadError.message.includes("not authorized") ||
                               uploadError.message.includes("not found");
      
      if (retryAttempt < MAX_RETRIES && !isPermissionError) {
        console.log(`Retrying upload (attempt ${retryAttempt + 2}/${MAX_RETRIES + 1})...`);
        // Wait exponentially longer between retries (1s, 2s, 4s)
        const backoffTime = Math.pow(2, retryAttempt) * 1000;
        console.log(`Waiting ${backoffTime/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return uploadFileWithRetry(file, fileName, bucketName, retryAttempt + 1);
      }
      
      // Determine a more user-friendly error message based on the error message
      if (uploadError.message.includes("permission") || uploadError.message.includes("not authorized")) {
        throw new Error("Permission denied: You don't have access to upload files. Please try again or contact support.");
      } else if (uploadError.message.includes("bucket") && uploadError.message.includes("not found")) {
        throw new Error(`Storage bucket "${bucketName}" not found. Please contact support.`);
      } else if (uploadError.message.includes("network")) {
        throw new Error("Network error: Please check your internet connection and try again.");
      } else if (uploadError.message.includes("size") || (file.size > 50 * 1024 * 1024)) {
        throw new Error("File too large: The maximum file size is 50MB.");
      } else {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
    }

    console.log("Upload successful, getting public URL...");
    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }
    
    console.log("File upload complete. Public URL:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error("Final upload error:", error);
    // If it's already an Error with a message, throw it directly
    if (error.message) {
      throw error;
    }
    // Otherwise, create a new Error
    throw new Error(`File upload failed: ${error}`);
  }
};
