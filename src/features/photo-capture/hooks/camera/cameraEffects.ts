
export const createCameraEffects = (state: any, actions: any, cleanup: any) => {
  const { 
    setCapturedImage, 
    setIsPhotoApproved 
  } = state;
  
  const { startCamera } = actions;
  const { performFullCleanup } = cleanup;

  const initializeOnMount = () => {
    console.log("Camera component mounted");
    
    // Check for existing captured image in session storage
    const storedImage = sessionStorage.getItem("solePhoto");
    if (storedImage) {
      console.log("Restored image from session storage");
      setCapturedImage(storedImage);
      // Auto-approve restored photos since they were previously saved
      setIsPhotoApproved(true);
    } else {
      // Start camera with slight delay to ensure DOM is ready
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  };

  const cleanupOnUnmount = () => {
    console.log("Camera component unmounting - performing full cleanup");
    performFullCleanup();
  };

  return {
    initializeOnMount,
    cleanupOnUnmount,
  };
};
