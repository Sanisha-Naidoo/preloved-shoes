
import { toast } from "@/components/ui/sonner";

export const capturePhotoFromVideo = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  setCapturedImage: (image: string | null) => void,
  cleanupFn: () => void
): void => {
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
    cleanupFn();
    
    toast.success("Photo captured successfully!");
  } catch (error) {
    console.error("Error capturing photo:", error);
    toast.error("Failed to capture photo. Please try again or upload manually.");
  }
};

export const uploadImageManually = (
  setCapturedImage: (image: string | null) => void,
  cleanupFn: () => void
): void => {
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
