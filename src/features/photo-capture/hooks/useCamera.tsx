
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initializeCamera, cleanupCameraResources } from "./camera/cameraInitialization";
import { capturePhotoFromVideo, uploadImageManually } from "./camera/photoCapture";
import { CameraState, CameraActions, CameraRefs } from "./camera/types";
import { toast } from "@/components/ui/sonner";

export const useCamera = (): CameraState & CameraActions & CameraRefs => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPhotoApproved, setIsPhotoApproved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset all camera-related state on unmount
  useEffect(() => {
    console.log("Camera component mounted");
    
    // Check for existing captured image in session storage
    const storedImage = sessionStorage.getItem("solePhoto");
    if (storedImage) {
      console.log("Restored image from session storage");
      setCapturedImage(storedImage);
      // Don't automatically approve restored photos
      setIsPhotoApproved(false);
    } else {
      // Start camera with slight delay to ensure DOM is ready
      setTimeout(() => {
        startCamera();
      }, 500);
    }
    
    return () => {
      console.log("Camera component unmounted");
      stopCamera();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    // Don't retry if we already have an image
    if (capturedImage) {
      console.log("Not starting camera: already have image");
      return;
    }
    
    console.log("Starting camera...");
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
    cleanupCameraResources(streamRef);
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
    // Don't reset other states here as it might disrupt the UI flow
  };

  const capturePhoto = () => {
    capturePhotoFromVideo(
      videoRef,
      canvasRef,
      setCapturedImage,
      stopCamera
    );
    // Reset approval status when capturing a new photo
    setIsPhotoApproved(false);
  };

  const cancelCameraAccess = () => {
    setIsLoading(false);
    setCameraError("Camera access canceled by user");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const retryCamera = () => {
    console.log("Retrying camera - full reset");
    // First stop camera and clean up existing resources
    stopCamera();
    
    // Clear timeout to prevent any pending operations
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset all state variables in order
    setCameraError(null);
    setCapturedImage(null);
    setIsPhotoApproved(false);
    setIsCameraOpen(false);
    setIsLoading(false);
    
    // Also clear from session storage
    sessionStorage.removeItem("solePhoto");
    
    // Delay starting the camera to ensure cleanup is complete
    console.log("Will start camera after delay");
    setTimeout(() => {
      console.log("Delayed camera start executing now");
      startCamera();
    }, 800); // Increased delay to 800ms to ensure cleanup is complete
  };
  
  const uploadPhotoManually = () => {
    console.log("Manual photo upload initiated");
    // Stop any active camera first
    stopCamera();
    setIsLoading(false);
    setCameraError(null);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    uploadImageManually(setCapturedImage, stopCamera);
    // Reset approval status when uploading a new photo
    setIsPhotoApproved(false);
  };

  // New function to approve the captured photo
  const approvePhoto = () => {
    setIsPhotoApproved(true);
  };

  // Expose the necessary functions and state
  return {
    capturedImage,
    isCameraOpen,
    isLoading,
    cameraError,
    isPhotoApproved,
    videoRef,
    canvasRef,
    capturePhoto,
    retryCamera,
    cancelCameraAccess,
    startCamera,
    stopCamera,
    uploadPhotoManually,
    approvePhoto,
  };
};
