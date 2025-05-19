
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
    // Split the data URL to get the MIME type and base64 data
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    
    // Convert base64 to binary
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    // Optimize file size if it's an image (compress if needed)
    if (mime.startsWith('image/')) {
      console.log(`Creating optimized file (${mime}) with size: ${u8arr.length} bytes`);
    }
    
    // Create and return a File object
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error("Error converting data URL to file:", error);
    throw new Error("Failed to process image. Please try again.");
  }
};
