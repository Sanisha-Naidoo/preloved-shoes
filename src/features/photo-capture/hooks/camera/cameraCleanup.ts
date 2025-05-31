
import { cleanupCameraResources } from "./cameraInitialization";

export const createCleanupUtilities = (state: any) => {
  const {
    setIsLoading,
    setIsCameraOpen,
    setCapturedImage,
    setCameraError,
    setIsPhotoApproved,
    videoRef,
    streamRef,
    timeoutRef,
    initAttemptRef,
  } = state;

  // New comprehensive cleanup function
  const performFullCleanup = () => {
    console.log("Performing full cleanup of all camera resources");
    
    // Stop camera stream
    stopCamera();
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset ref counters
    initAttemptRef.current = 0;
    
    // Clear video element source if it exists
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onerror = null;
    }
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

  const retryCamera = () => {
    console.log("Retrying camera - performing full reset");
    
    // Full cleanup first
    performFullCleanup();
    
    // Reset all state variables in specific order
    setCameraError(null);
    setIsLoading(false);
    setIsCameraOpen(false);
    setCapturedImage(null);
    setIsPhotoApproved(false);
    
    // Clear from session storage
    sessionStorage.removeItem("solePhoto");
    
    // Reset attempt counter
    initAttemptRef.current = 0;
    
    // Longer delay to ensure DOM is ready again
    console.log("Will start camera after delay");
    setTimeout(() => {
      console.log("Delayed camera start executing now");
      // We need to call startCamera from the actions
    }, 1000);
  };

  return {
    performFullCleanup,
    retryCamera,
  };
};
