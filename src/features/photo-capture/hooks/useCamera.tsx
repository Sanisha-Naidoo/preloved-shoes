
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

export const useCamera = () => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVideoElementReady, setIsVideoElementReady] = useState(false);
  const initAttemptedRef = useRef(false);

  // Track component mount status
  useEffect(() => {
    console.log("Component mounted");
    setIsMounted(true);
    
    return () => {
      console.log("Component unmounted");
      setIsMounted(false);
      stopCamera();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Check if video element is ready using layout effect (runs before browser paint)
  useLayoutEffect(() => {
    if (isMounted && videoRef.current) {
      console.log("Video element is ready in DOM");
      setIsVideoElementReady(true);
    }
  }, [isMounted]);

  // Watch for video element readiness and initialize camera
  useEffect(() => {
    if (isMounted && isVideoElementReady && !initAttemptedRef.current) {
      console.log("Video element is ready and component is mounted, starting camera");
      initAttemptedRef.current = true;
      
      // Recover any previously captured image from session storage
      const storedImage = sessionStorage.getItem("solePhoto");
      if (storedImage) {
        console.log("Restored previous image from session storage");
        setCapturedImage(storedImage);
      } else if (!capturedImage) {
        // Small delay to ensure DOM is fully ready
        const initTimeout = setTimeout(() => {
          startCamera();
        }, 300);
        return () => clearTimeout(initTimeout);
      }
    }
  }, [isMounted, isVideoElementReady, capturedImage]);

  const startCamera = async () => {
    // Don't try to start camera if we already have a captured image or component is unmounted
    if (capturedImage || !isMounted) {
      console.log("Not starting camera: already have image or component unmounted");
      return;
    }

    if (!videoRef.current) {
      console.log("Video element isn't available yet, cannot start camera");
      setCameraError("Camera initialization failed: Video element not ready");
      return;
    }

    setIsLoading(true);
    setCameraError(null);
    
    // Set a timeout to detect if camera is taking too long
    const timeout = setTimeout(() => {
      if (isLoading && isMounted) {
        console.log("Camera access timed out after 8 seconds");
        setCameraError("Camera access timed out. Please try uploading a photo instead.");
        setIsLoading(false);
      }
    }, 8000);
    
    setTimeoutId(timeout);
    
    try {
      console.log("Requesting camera access with constraints");
      
      // Check if running on a secure context (https or localhost)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.log("Not on secure context, camera access requires HTTPS");
        setCameraError("Camera access requires HTTPS. Please use a secure connection.");
        setIsLoading(false);
        clearTimeout(timeout);
        return;
      }
      
      // Check if mediaDevices API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("MediaDevices API not supported");
        setCameraError("Your browser doesn't support camera access");
        setIsLoading(false);
        clearTimeout(timeout);
        return;
      }
      
      // Verify video element exists before attempting to access camera
      if (!videoRef.current) {
        console.log("Video element is null before camera access attempt");
        setCameraError("Camera initialization failed: Video element not found");
        setIsLoading(false);
        clearTimeout(timeout);
        return;
      }
      
      // Request camera permissions with specific constraints
      const constraints = { 
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      console.log("Calling getUserMedia...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera access granted, stream received:", !!stream);
      
      // Check if component is still mounted
      if (!isMounted) {
        console.log("Component unmounted during camera initialization, cleaning up");
        stream.getTracks().forEach(track => track.stop());
        clearTimeout(timeout);
        return;
      }
      
      // Double check video element exists
      if (!videoRef.current) {
        console.error("Video element reference is null AFTER getting stream - cannot initialize camera");
        setCameraError("Could not find video element. Please try uploading a photo instead.");
        setIsLoading(false);
        clearTimeout(timeout);
        
        // Cleanup stream if we can't attach it
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      console.log("Attaching stream to video element");
      // Once we've confirmed the video element exists, attach the stream
      videoRef.current.srcObject = stream;
      
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded");
        // Double check component is still mounted
        if (!isMounted || !videoRef.current) {
          console.error("Component unmounted or video element lost after metadata loaded");
          stream.getTracks().forEach(track => track.stop());
          setIsLoading(false);
          return;
        }
        
        videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
          setCameraError("Failed to start video stream");
          setIsLoading(false);
        });
        
        setIsCameraOpen(true);
        setIsLoading(false);
        clearTimeout(timeout);
        console.log("Camera successfully initialized and playing");
      };
      
      // Store stream reference for cleanup
      streamRef.current = stream;
    } catch (error: any) {
      if (!isMounted) return; // Don't update state if unmounted
      
      console.error("Error accessing camera:", error);
      
      // Provide more specific error messages based on error type
      if (error.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please enable camera permissions in your browser settings.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera found on your device.");
      } else if (error.name === "NotReadableError") {
        setCameraError("Camera is already in use by another application.");
      } else {
        setCameraError(`Camera error: ${error.message || "Unknown error"}`);
      }
      
      setIsLoading(false);
      clearTimeout(timeout);
      toast.error("Camera access failed. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas element reference is null");
      toast.error("Failed to capture photo. Please try again.");
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw the video frame to the canvas
      const context = canvas.getContext("2d");
      if (!context) {
        toast.error("Failed to get canvas context.");
        return;
      }
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedImage(imageDataUrl);
      stopCamera();
      
      // Store the image in session storage
      sessionStorage.setItem("solePhoto", imageDataUrl);
      
      toast.success("Photo captured successfully!");
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Failed to capture photo. Please try again.");
    }
  };
  
  const useMockImage = () => {
    // Use a placeholder image URL
    const mockImageUrl = "/placeholder.svg";
    setCapturedImage(mockImageUrl);
    sessionStorage.setItem("solePhoto", mockImageUrl);
    toast.success("Using placeholder image (camera unavailable)");
  };

  const cancelCameraAccess = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsLoading(false);
    setCameraError("Camera access canceled by user");
  };

  const retryCamera = () => {
    stopCamera();
    setCameraError(null);
    setCapturedImage(null);
    
    // Clear any stored image
    sessionStorage.removeItem("solePhoto");
    
    // Small delay to make sure the cleanup is done
    setTimeout(() => {
      startCamera();
    }, 500);
  };
  
  // Navigation to manual entry page
  const navigateToManualEntry = () => {
    navigate("/manual-entry");
    toast.info("Redirecting to manual entry form");
  };

  // Improved function to upload photo manually
  const uploadPhotoManually = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    // Handle file selection
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) {
        console.log("No file selected");
        return;
      }
      
      const file = target.files[0];
      
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Show loading indicator
      setIsLoading(true);
      
      // Read the selected file
      const reader = new FileReader();
      reader.onload = (e) => {
        // Check if component is still mounted
        if (!isMounted) return;
        
        const imageDataUrl = e.target?.result as string;
        if (imageDataUrl) {
          setCapturedImage(imageDataUrl);
          sessionStorage.setItem("solePhoto", imageDataUrl);
          toast.success('Image uploaded successfully!');
          // Clear any previous camera errors
          setCameraError(null);
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        if (!isMounted) return;
        toast.error('Failed to read the selected file');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(file);
    };
    
    // Trigger the file input dialog
    fileInput.click();
  };

  return {
    capturedImage,
    isCameraOpen,
    isLoading,
    cameraError,
    videoRef,
    canvasRef,
    capturePhoto,
    useMockImage,
    retryCamera,
    cancelCameraAccess,
    startCamera,
    stopCamera,
    navigateToManualEntry,
    uploadPhotoManually,
  };
};
