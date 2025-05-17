
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initializeCamera, cleanupCameraResources } from "./camera/cameraInitialization";
import { capturePhotoFromVideo, uploadImageManually } from "./camera/photoCapture";
import { CameraState, CameraActions, CameraRefs } from "./camera/types";

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
    cleanupCameraResources(streamRef);
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
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
    stopCamera();
    setCameraError(null);
    setCapturedImage(null);
    setIsPhotoApproved(false);
    sessionStorage.removeItem("solePhoto");
    
    // Add a small delay before restarting camera to ensure cleanup is complete
    setTimeout(() => {
      startCamera();
    }, 500);
  };
  
  const uploadPhotoManually = () => {
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
