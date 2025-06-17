
import { toast } from "sonner";
import { initializeCamera, cleanupCameraResources } from "./cameraInitialization";
import { capturePhotoFromVideo, uploadImageManually } from "./photoCapture";

export const createCameraActions = (state: any) => {
  const {
    capturedImage,
    setCapturedImage,
    setIsCameraOpen,
    setIsLoading,
    setCameraError,
    setIsPhotoApproved,
    videoRef,
    canvasRef,
    streamRef,
    timeoutRef,
    initAttemptRef,
  } = state;

  const startCamera = async () => {
    // Don't retry if we already have an image
    if (capturedImage) {
      console.log("Not starting camera: already have image");
      return;
    }
    
    // Increment initialization attempt counter
    initAttemptRef.current += 1;
    console.log(`Starting camera... (attempt #${initAttemptRef.current})`);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Make sure previous resources are cleaned up
    cleanupCameraResources(streamRef);
    
    // Start camera initialization
    await initializeCamera(
      videoRef,
      streamRef,
      setIsLoading,
      setIsCameraOpen,
      setCameraError,
      timeoutRef
    );
  };

  const stopCamera = () => {
    console.log("Stopping camera and cleaning up resources");
    
    // Clean up media resources
    cleanupCameraResources(streamRef);
    
    // Clear video element source
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    // Update state to reflect camera is closed
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    console.log("Capturing photo from video");
    capturePhotoFromVideo(
      videoRef,
      canvasRef,
      setCapturedImage,
      stopCamera
    );
    // Reset approval status when capturing a new photo - requires manual approval
    setIsPhotoApproved(false);
  };

  const deletePhoto = () => {
    console.log("Deleting captured photo");
    setCapturedImage(null);
    setIsPhotoApproved(false);
    
    // Clear from session storage
    sessionStorage.removeItem("solePhoto");
    
    // Reset camera state
    setCameraError(null);
    setIsLoading(false);
    setIsCameraOpen(false);
    
    toast.success("Photo deleted successfully!");
  };

  const cancelCameraAccess = () => {
    console.log("Camera access canceled by user");
    setIsLoading(false);
    setCameraError("Camera access canceled by user");
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Make sure to stop any active stream
    stopCamera();
  };

  const uploadPhotoManually = () => {
    console.log("Manual photo upload initiated - stopping all camera activity");
    
    // Stop any active camera first and clear all camera-related state
    stopCamera();
    
    // Reset states completely
    setIsLoading(false);
    setCameraError(null);
    setIsCameraOpen(false); // Explicitly ensure camera is closed
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset attempt counter to prevent auto-restart
    initAttemptRef.current = 0;
    
    // Custom upload handler that handles state properly
    const handleManualUpload = (image: string | null) => {
      console.log("Manual upload callback triggered with image:", !!image);
      
      if (image) {
        // Set the image and ensure camera stays off
        setCapturedImage(image);
        setIsPhotoApproved(true);
        setIsCameraOpen(false); // Double-ensure camera is off
        setIsLoading(false);
        setCameraError(null);
        
        console.log("Manual upload completed successfully - camera should stay off");
        toast.success("Photo uploaded successfully!");
      }
    };
    
    // Use the standard upload function with our custom handler
    uploadImageManually(handleManualUpload, () => {
      // Custom cleanup that doesn't restart camera
      console.log("Manual upload cleanup - ensuring camera stays off");
    });
  };

  const approvePhoto = () => {
    console.log("Photo approved by user");
    setIsPhotoApproved(true);
    toast.success("Photo approved! Ready to continue.");
  };

  return {
    startCamera,
    stopCamera,
    capturePhoto,
    deletePhoto,
    cancelCameraAccess,
    uploadPhotoManually,
    approvePhoto,
  };
};
