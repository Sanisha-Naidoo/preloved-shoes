
import { useEffect } from "react";
import { useCameraState } from "./camera/cameraState";
import { createCameraActions } from "./camera/cameraActions";
import { createCleanupUtilities } from "./camera/cameraCleanup";
import { createCameraEffects } from "./camera/cameraEffects";
import { CameraState, CameraActions, CameraRefs } from "./camera/types";

export const useCamera = (): CameraState & CameraActions & CameraRefs & { deletePhoto: () => void } => {
  // Initialize state
  const state = useCameraState();
  
  // Create actions
  const actions = createCameraActions(state);
  
  // Create cleanup utilities
  const cleanup = createCleanupUtilities({
    ...state,
    stopCamera: actions.stopCamera,
  });
  
  // Update cleanup to have access to startCamera
  const updatedCleanup = {
    ...cleanup,
    retryCamera: () => {
      console.log("Retrying camera - performing full reset");
      
      // Full cleanup first
      cleanup.performFullCleanup();
      
      // Reset all state variables in specific order
      state.setCameraError(null);
      state.setIsLoading(false);
      state.setIsCameraOpen(false);
      state.setCapturedImage(null);
      state.setIsPhotoApproved(false);
      
      // Clear from session storage
      sessionStorage.removeItem("solePhoto");
      
      // Reset attempt counter
      state.initAttemptRef.current = 0;
      
      // Longer delay to ensure DOM is ready again
      console.log("Will start camera after delay");
      setTimeout(() => {
        console.log("Delayed camera start executing now");
        actions.startCamera();
      }, 1000);
    }
  };
  
  // Create effects with modified initialization logic
  const effects = {
    initializeOnMount: () => {
      console.log("Camera component mounted");
      
      // Clear any existing photo from session storage on mount
      sessionStorage.removeItem("solePhoto");
      
      // Reset all state
      state.setCapturedImage(null);
      state.setIsPhotoApproved(false);
      state.setCameraError(null);
      state.setIsLoading(false);
      state.setIsCameraOpen(false);
      
      // Only start camera if we don't already have an image
      if (!state.capturedImage) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          actions.startCamera();
        }, 100);
      }
    },
    
    cleanupOnUnmount: () => {
      console.log("Camera component unmounting - performing full cleanup");
      cleanup.performFullCleanup();
    }
  };

  // Reset all camera-related state on mount
  useEffect(() => {
    effects.initializeOnMount();
    
    // Return cleanup function
    return () => {
      effects.cleanupOnUnmount();
    };
  }, []);

  // Expose the necessary functions and state
  return {
    capturedImage: state.capturedImage,
    isCameraOpen: state.isCameraOpen,
    isLoading: state.isLoading,
    cameraError: state.cameraError,
    isPhotoApproved: state.isPhotoApproved,
    videoRef: state.videoRef,
    canvasRef: state.canvasRef,
    capturePhoto: actions.capturePhoto,
    deletePhoto: actions.deletePhoto,
    retryCamera: updatedCleanup.retryCamera,
    cancelCameraAccess: actions.cancelCameraAccess,
    startCamera: actions.startCamera,
    stopCamera: actions.stopCamera,
    uploadPhotoManually: actions.uploadPhotoManually,
    approvePhoto: actions.approvePhoto,
  };
};
