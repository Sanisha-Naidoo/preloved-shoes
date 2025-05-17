
import { useState, useRef, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

export const useCamera = () => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initAttemptedRef = useRef(false);

  // Reset all camera-related state on unmount
  useEffect(() => {
    console.log("Camera component mounted");
    
    // Check for existing captured image in session storage
    const storedImage = sessionStorage.getItem("solePhoto");
    if (storedImage) {
      console.log("Restored image from session storage");
      setCapturedImage(storedImage);
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
    
    // Set hard timeout to prevent getting stuck in loading state
    setIsLoading(true);
    setCameraError(null);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout - force exit loading state after 10 seconds
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.log("Camera access timed out after 10 seconds");
        setCameraError("Camera access timed out. Please try uploading a photo instead.");
        setIsLoading(false);
      }
    }, 10000);
    
    try {
      console.log("Requesting camera access");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Your browser doesn't support camera access");
        setIsLoading(false);
        return;
      }
      
      // Request camera with environment facing mode if available
      const constraints = { 
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera stream obtained");
      
      // Save the stream for later cleanup
      streamRef.current = stream;
      
      if (!videoRef.current) {
        setCameraError("Camera initialization error: Video element not found.");
        stopCamera();
        setIsLoading(false);
        return;
      }
      
      videoRef.current.srcObject = stream;
      
      // Set up event handler for when video metadata is loaded
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded");
        
        if (videoRef.current) {
          videoRef.current.play()
            .then(() => {
              console.log("Video playback started");
              setIsCameraOpen(true);
              setIsLoading(false);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            })
            .catch(error => {
              console.error("Error playing video:", error);
              setCameraError("Failed to start video stream");
              stopCamera();
              setIsLoading(false);
            });
        }
      };
      
      videoRef.current.onerror = () => {
        console.error("Video element error");
        setCameraError("Error with video playback");
        stopCamera();
        setIsLoading(false);
      };
      
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      
      // Provide more specific error messages
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      toast.error("Camera access failed. Please try the upload option instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Failed to capture photo. Please try again or upload manually.");
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const context = canvas.getContext("2d");
      if (!context) {
        toast.error("Failed to get canvas context.");
        return;
      }
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      
      setCapturedImage(imageDataUrl);
      sessionStorage.setItem("solePhoto", imageDataUrl);
      stopCamera();
      
      toast.success("Photo captured successfully!");
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Failed to capture photo. Please try again or upload manually.");
    }
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
    sessionStorage.removeItem("solePhoto");
    
    setTimeout(() => {
      startCamera();
    }, 500);
  };
  
  // Improved function to upload photo manually
  const uploadPhotoManually = () => {
    // Stop any active camera first
    stopCamera();
    setIsLoading(false);
    setCameraError(null);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    // Handle file selection
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) {
        return;
      }
      
      const file = target.files[0];
      
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Show loading indicator
      toast.info("Processing image...");
      
      // Read the selected file
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        if (imageDataUrl) {
          setCapturedImage(imageDataUrl);
          sessionStorage.setItem("solePhoto", imageDataUrl);
          toast.success('Image uploaded successfully!');
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read the selected file');
      };
      
      reader.readAsDataURL(file);
    };
    
    // Trigger the file input dialog
    fileInput.click();
  };

  // Expose the necessary functions and state
  return {
    capturedImage,
    isCameraOpen,
    isLoading,
    cameraError,
    videoRef,
    canvasRef,
    capturePhoto,
    retryCamera,
    cancelCameraAccess,
    startCamera,
    stopCamera,
    uploadPhotoManually,
  };
};
