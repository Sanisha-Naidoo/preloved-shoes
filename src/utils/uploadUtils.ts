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
    
    console.log(`Upload attempt ${retryAttempt + 1}/${MAX_RETRIES + 1} for file "${fileName}" (${file.size} bytes)`);
    
    // Direct upload to the existing bucket
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Overwrite if exists
      });

    if (uploadError) {
      console.error(`Upload error on attempt ${retryAttempt + 1}:`, uploadError);
      
      // Classify errors - determine if we should retry
      const errorMessage = uploadError.message.toLowerCase();
      const isRetryableError = 
        errorMessage.includes("network") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("502") ||
        errorMessage.includes("503") ||
        errorMessage.includes("504");
      
      const isPermissionError = 
        errorMessage.includes("permission") ||
        errorMessage.includes("not authorized") ||
        errorMessage.includes("forbidden") ||
        errorMessage.includes("access denied");
      
      const isBucketError = 
        errorMessage.includes("bucket") && 
        errorMessage.includes("not found");
      
      // Only retry for network/server errors, not permission or configuration issues
      if (isRetryableError && retryAttempt < MAX_RETRIES) {
        const backoffTime = Math.pow(2, retryAttempt) * 1000;
        console.log(`Retrying upload in ${backoffTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        // NON-RECURSIVE retry - return the result of a new call
        return await uploadFileWithRetry(file, fileName, bucketName, retryAttempt + 1);
      }
      
      // Provide user-friendly error messages based on error type
      if (isPermissionError) {
        throw new Error("Permission denied: Unable to upload files. Please contact support.");
      } else if (isBucketError) {
        throw new Error(`Storage bucket "${bucketName}" not found. Please contact support.`);
      } else if (file.size > 50 * 1024 * 1024) {
        throw new Error("File too large: The maximum file size is 50MB.");
      } else if (errorMessage.includes("invalid") && errorMessage.includes("type")) {
        throw new Error("Invalid file type: Only image files are supported.");
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
    console.error(`Final upload error (attempt ${retryAttempt + 1}):`, error);
    
    // If it's already a structured Error, throw it directly
    if (error instanceof Error) {
      throw error;
    }
    
    // Otherwise, create a new Error
    throw new Error(`File upload failed: ${error}`);
  }
};
