
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
    throw new Error("Missing shoe details. Please complete the shoe information form.");
  }
  
  try {
    // Verify JSON is valid
    const shoeDetails = JSON.parse(shoeDetailsStr);
    
    // Validate required fields in shoe details
    const requiredFields = ['brand', 'size', 'sizeUnit', 'condition'];
    const missingFields = requiredFields.filter(field => !shoeDetails[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required shoe information: ${missingFields.join(', ')}. Please complete all required fields.`);
    }
    
    // Photo is now optional - validate only if present
    if (solePhotoStr && !solePhotoStr.startsWith('data:image')) {
      throw new Error("Invalid photo format. Please capture a new photo.");
    }
    
    console.log("Data validation successful");
    return { shoeDetails, solePhoto: solePhotoStr || null };
  } catch (e: any) {
    console.error("Data validation error:", e);
    if (e.message.includes("Missing required") || e.message.includes("Invalid photo")) {
      throw e; // Use the detailed error message we created
    } else {
      throw new Error("Invalid shoe data format. Please try again.");
    }
  }
};
