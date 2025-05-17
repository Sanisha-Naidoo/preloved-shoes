
import { useState, useRef, useEffect } from "react";
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

  // Only initialize camera after component is fully mounted
  useEffect(() => {
    // Set initialized flag to true after component is mounted
    setIsInitialized(true);

    // Clean up camera resources when component unmounts
    return () => {
      stopCamera();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Start camera only after initialization is complete
  useEffect(() => {
    if (isInitialized) {
      startCamera();
    }
  }, [isInitialized]);

  const startCamera = async () => {
    // Don't try to start camera if we already have a captured image
    if (capturedImage) {
      return;
    }

    setIsLoading(true);
    setCameraError(null);
    
    // Set a timeout to detect if camera is taking too long
    const timeout = setTimeout(() => {
      if (isLoading) {
        setCameraError("Camera initialization is taking too long. Please check your permissions or try again.");
        setIsLoading(false);
        console.log("Camera access timed out");
      }
    }, 8000);
    
    setTimeoutId(timeout);
    
    try {
      console.log("Requesting camera access with constraints:", {
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // Check if running on a secure context (https or localhost)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setCameraError("Camera access requires HTTPS. Please use a secure connection.");
        setIsLoading(false);
        clearTimeout(timeout);
        return;
      }
      
      // Check if mediaDevices API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Your browser doesn't support camera access");
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
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera access granted, stream received:", !!stream);
      
      // Check if component is still mounted by checking if videoRef still exists
      if (!videoRef.current) {
        console.error("Video element reference is null - component may have unmounted");
        setCameraError("Failed to initialize video element");
        setIsLoading(false);
        clearTimeout(timeout);
        
        // Cleanup stream if we can't attach it
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        if (!videoRef.current) {
          console.error("Video element reference is null after metadata loaded - component may have unmounted");
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
      };
      
      // Store stream reference for cleanup
      streamRef.current = stream;
    } catch (error: any) {
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
