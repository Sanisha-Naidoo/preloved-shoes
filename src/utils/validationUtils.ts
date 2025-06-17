
/**
 * Validates that required data is present in sessionStorage
 * @returns An object containing validated shoe details and optional sole photo
 */
export const validateRequiredData = () => {
  const shoeDetailsStr = sessionStorage.getItem("shoeDetails");
  const solePhotoStr = sessionStorage.getItem("solePhoto");
  
  console.log("Validating submission data...");
  console.log("Shoe details exists:", !!shoeDetailsStr);
  console.log("Sole photo exists:", !!solePhotoStr);
  
  if (!shoeDetailsStr) {
    throw new Error("Session data lost. Please restart the submission process.");
  }
  
  try {
    // Verify JSON is valid
    const shoeDetails = JSON.parse(shoeDetailsStr);
    
    // Basic validation - assume data was validated in previous steps
    if (!shoeDetails.brand || !shoeDetails.size || !shoeDetails.condition) {
      throw new Error("Session data corrupted. Please restart the submission process.");
    }
    
    console.log("Data validation successful");
    return { shoeDetails, solePhoto: solePhotoStr || null };
  } catch (e: any) {
    console.error("Data validation error:", e);
    throw new Error("Session data corrupted. Please restart the submission process.");
  }
};
