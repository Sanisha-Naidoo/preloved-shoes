import { toast } from "sonner";

// Helper function to resize image to prevent upload issues
const resizeImage = (dataUrl: string, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.floor(height * (maxWidth / width));
          width = maxWidth;
        } else {
          width = Math.floor(width * (maxHeight / height));
          height = maxHeight;
        }
      }
      
      // Draw resized image to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw image with white background to ensure consistent format
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to data URL with specified quality
      const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = dataUrl;
  });
};

export const capturePhotoFromVideo = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  setCapturedImage: (image: string | null) => void,
  cleanupFn: () => void
): Promise<void> => {
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
    
    // Resize the image to prevent upload issues
    const resizedImage = await resizeImage(imageDataUrl);
    
    setCapturedImage(resizedImage);
    cleanupFn();
    
    toast.success("Photo captured successfully!");
  } catch (error) {
    console.error("Error capturing photo:", error);
    toast.error("Failed to capture photo. Please try again or upload manually.");
  }
};

export const uploadImageManually = async (
  setCapturedImage: (image: string | null) => void,
  cleanupFn: () => void
): Promise<void> => {
  // Create a file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  
  // Handle file selection
  fileInput.onchange = async (event) => {
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
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      if (imageDataUrl) {
        try {
          // Resize the image to prevent upload issues
          const resizedImage = await resizeImage(imageDataUrl);
          setCapturedImage(resizedImage);
          toast.success('Image uploaded successfully!');
        } catch (err) {
          toast.error('Failed to process image');
          console.error('Image processing error:', err);
        }
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
