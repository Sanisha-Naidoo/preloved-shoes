
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
  const initAttemptRef = useRef<number>(0);

  // Reset all camera-related state on mount
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
    
    // Return cleanup function
    return () => {
      console.log("Camera component unmounting - performing full cleanup");
      performFullCleanup();
    };
  }, []);

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
    // Reset approval status when capturing a new photo
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
      startCamera();
    }, 1000); // Increased delay to 1000ms for more reliable restart
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
    
    uploadImageManually(setCapturedImage, stopCamera);
    
    // Reset approval status when uploading a new photo
    setIsPhotoApproved(false);
  };

  // Approve the captured photo
  const approvePhoto = () => {
    console.log("Photo approved by user");
    setIsPhotoApproved(true);
    toast.success("Photo approved! Ready to continue.");
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
