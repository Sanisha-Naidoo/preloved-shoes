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
    
    // Check if the bucket exists first
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket(bucketName);
      
    if (bucketError) {
      console.error("Bucket access error:", bucketError);
      
      // For the first attempt, try creating the bucket if it doesn't exist (only on first try)
      if (retryAttempt === 0 && bucketError.message.includes("not found")) {
        console.log(`Bucket "${bucketName}" not found, attempting to create...`);
        try {
          const { data: newBucket, error: createError } = await supabase
            .storage
            .createBucket(bucketName, { public: true });
          
          if (createError) {
            throw new Error(`Failed to create bucket: ${createError.message}`);
          }
          console.log(`Created bucket "${bucketName}" successfully`);
        } catch (createErr) {
          console.error("Error creating bucket:", createErr);
          throw new Error(`Failed to access or create storage bucket: ${createErr}`);
        }
      } else if (bucketError.message.includes("not found")) {
        throw new Error(`Storage bucket "${bucketName}" not found. Please ensure it exists.`);
      } else {
        throw new Error(`Storage access error: ${bucketError.message}`);
      }
    }
    
    // Attempt the upload
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
      console.error("Error code:", uploadError.code);
      console.error("Error message:", uploadError.message);
      console.error("Error status:", uploadError.status);
      
      // Check if we should retry
      if (retryAttempt < MAX_RETRIES) {
        console.log(`Retrying upload (attempt ${retryAttempt + 2}/${MAX_RETRIES + 1})...`);
        // Wait exponentially longer between retries (1s, 2s, 4s)
        const backoffTime = Math.pow(2, retryAttempt) * 1000;
        console.log(`Waiting ${backoffTime/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return uploadFileWithRetry(file, fileName, bucketName, retryAttempt + 1);
      }
      
      // Determine a more user-friendly error message based on the error code/message
      if (uploadError.message.includes("permission") || uploadError.message.includes("not authorized")) {
        throw new Error("Permission denied: You don't have access to upload files. Please try again or contact support.");
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
