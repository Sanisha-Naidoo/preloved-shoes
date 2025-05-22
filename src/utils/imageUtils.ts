
/**
 * Utility functions for handling images
 */

/**
 * Converts a data URL to a File object
 * @param dataUrl The data URL to convert
 * @param filename The filename to use for the resulting File
 * @returns A Promise resolving to a File object
 */
export const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File> => {
  try {
    console.log("Converting data URL to File...");
    
    // Validate the data URL format
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      throw new Error("Invalid data URL format");
    }
    
    // Split the data URL to get the MIME type and base64 data
    const arr = dataUrl.split(",");
    if (arr.length !== 2) {
      throw new Error("Invalid data URL structure");
    }
    
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error("Could not determine MIME type from data URL");
    }
    
    const mime = mimeMatch[1];
    
    // Validate that this is an image type we support
    if (!mime.startsWith('image/')) {
      throw new Error(`Unsupported file type: ${mime}. Only images are supported.`);
    }
    
    try {
      const bstr = atob(arr[1]);
      
      // Convert base64 to binary
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      // Check file size (limit to 10MB as a reasonable image size)
      const fileSizeMB = u8arr.length / (1024 * 1024);
      console.log(`Image size: ${fileSizeMB.toFixed(2)} MB`);
      
      if (fileSizeMB > 10) {
        throw new Error(`Image is too large (${fileSizeMB.toFixed(2)}MB). Maximum size is 10MB.`);
      }
      
      // Create and return a File object
      const file = new File([u8arr], filename, { type: mime });
      console.log(`Created file: ${filename}, type: ${mime}, size: ${file.size} bytes`);
      return file;
    } catch (e) {
      console.error("Base64 decoding error:", e);
      throw new Error("Failed to decode image data. The image may be corrupted.");
    }
  } catch (error: any) {
    console.error("Error converting data URL to file:", error);
    throw new Error(error.message || "Failed to process image. Please try again.");
  }
};

/**
 * Validates an image before processing
 * @param dataUrl The data URL to validate
 * @returns True if valid, throws an error if not
 */
export const validateImage = (dataUrl: string): boolean => {
  if (!dataUrl) {
    throw new Error("No image data provided");
  }
  
  if (!dataUrl.startsWith('data:image/')) {
    throw new Error("Invalid image format");
  }
  
  // Check size
  const approximateSizeInMB = (dataUrl.length * 3/4) / (1024 * 1024);
  if (approximateSizeInMB > 15) {
    throw new Error(`Image is too large (approximately ${approximateSizeInMB.toFixed(2)}MB). Please use a smaller image.`);
  }
  
  return true;
};
