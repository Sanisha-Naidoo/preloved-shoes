
import { toast } from "sonner";

export const initializeCamera = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  streamRef: React.MutableRefObject<MediaStream | null>,
  setIsLoading: (loading: boolean) => void,
  setIsCameraOpen: (open: boolean) => void,
  setCameraError: (error: string | null) => void,
  timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
): Promise<void> => {
  // Set hard timeout to prevent getting stuck in loading state
  setIsLoading(true);
  setCameraError(null);
  
  // Clear any existing timeout
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }
  
  // Set new timeout - force exit loading state after 15 seconds for mobile
  timeoutRef.current = setTimeout(() => {
    setIsLoading(false);
    setCameraError("Camera access timed out. Please try uploading a photo instead.");
  }, 15000);
  
  try {
    console.log("Requesting camera access");
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Your browser doesn't support camera access");
      setIsLoading(false);
      return;
    }
    
    // Enhanced mobile-friendly camera constraints
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let constraints: MediaStreamConstraints;
    
    if (isMobile) {
      // Mobile-optimized constraints
      constraints = { 
        video: { 
          facingMode: { ideal: "environment" }, // Back camera preferred
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: false
      };
    } else {
      // Desktop constraints
      constraints = { 
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
    }
    
    console.log("Using constraints:", constraints);
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log("Camera stream obtained");
    
    // Save the stream for later cleanup
    streamRef.current = stream;
    
    if (!videoRef.current) {
      setCameraError("Camera initialization error: Video element not found.");
      cleanupCameraResources(streamRef);
      setIsLoading(false);
      return;
    }
    
    videoRef.current.srcObject = stream;
    
    // Enhanced mobile video element configuration
    if (isMobile) {
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('webkit-playsinline', 'true');
      videoRef.current.muted = true;
    }
    
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
            setCameraError("Failed to start video stream. Try uploading a photo instead.");
            cleanupCameraResources(streamRef);
            setIsLoading(false);
          });
      }
    };
    
    videoRef.current.onerror = () => {
      console.error("Video element error");
      setCameraError("Error with video playback. Try uploading a photo instead.");
      cleanupCameraResources(streamRef);
      setIsLoading(false);
    };
    
  } catch (error: any) {
    console.error("Error accessing camera:", error);
    
    // Provide more specific error messages for mobile
    if (error.name === "NotAllowedError") {
      setCameraError("Camera access denied. Please enable camera permissions in your browser settings and try again.");
    } else if (error.name === "NotFoundError") {
      setCameraError("No camera found on your device. Please use the upload option instead.");
    } else if (error.name === "NotReadableError") {
      setCameraError("Camera is already in use by another application. Please close other apps and try again.");
    } else if (error.name === "OverconstrainedError") {
      setCameraError("Camera doesn't support the required settings. Please use the upload option instead.");
    } else if (error.name === "SecurityError") {
      setCameraError("Camera access blocked due to security settings. Please use the upload option instead.");
    } else {
      setCameraError(`Camera error: ${error.message || "Unknown error"}. Please try uploading a photo instead.`);
    }
    
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    toast.error("Camera access failed. Please try the upload option instead.");
  }
};

export const cleanupCameraResources = (
  streamRef: React.MutableRefObject<MediaStream | null>
): void => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => {
      track.stop();
    });
    streamRef.current = null;
  }
};
