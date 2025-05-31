
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
    console.log("Manual photo upload initiated");
    
    // Stop any active camera first
    stopCamera();
    
    // Reset states
    setIsLoading(false);
    setCameraError(null);
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Custom upload handler that auto-approves
    const autoApproveUpload = (image: string | null) => {
      setCapturedImage(image);
      if (image) {
        // Auto-approve manual uploads since user explicitly selected them
        setIsPhotoApproved(true);
        console.log("Manual upload auto-approved");
        toast.success("Photo uploaded and ready to continue!");
      }
    };
    
    uploadImageManually(autoApproveUpload, stopCamera);
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
    cancelCameraAccess,
    uploadPhotoManually,
    approvePhoto,
  };
};
