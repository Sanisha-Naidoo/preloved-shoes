
/**
 * Validates that required data is present in sessionStorage
 * @returns An object containing validated shoe details and sole photo
 */
export const validateRequiredData = () => {
  const shoeDetailsStr = sessionStorage.getItem("shoeDetails");
  const solePhotoStr = sessionStorage.getItem("solePhoto");
  
  if (!shoeDetailsStr) {
    throw new Error("Missing shoe details. Please complete the shoe information form.");
  }
  
  if (!solePhotoStr) {
    throw new Error("Missing shoe photo. Please capture a photo of your shoe sole.");
  }
  
  try {
    // Verify JSON is valid
    const shoeDetails = JSON.parse(shoeDetailsStr);
    return { shoeDetails, solePhoto: solePhotoStr };
  } catch (e) {
    throw new Error("Invalid shoe data format. Please try again.");
  }
};
