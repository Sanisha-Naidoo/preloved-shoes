
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Camera, Upload } from "lucide-react";

// Import our components
import { PhotoCaptureHeader } from "@/features/photo-capture/components/PhotoCaptureHeader";
import { CameraView } from "@/features/photo-capture/components/CameraView";
import { PhotoPreview } from "@/features/photo-capture/components/PhotoPreview";
import { CameraError } from "@/features/photo-capture/components/CameraError";
import { CameraLoading } from "@/features/photo-capture/components/CameraLoading";
import { useCamera } from "@/features/photo-capture/hooks/useCamera";

const PhotoCapture = () => {
  const navigate = useNavigate();
  const {
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
    uploadPhotoManually,
    approvePhoto,
    stopCamera,
  } = useCamera();

  const handleContinue = () => {
    if (!capturedImage) {
      toast.error("Please capture a photo of the sole before continuing.");
      return;
    }
    
    if (!isPhotoApproved) {
      toast.error("Please approve the photo before continuing.");
      return;
    }
    
    // Now save the image to session storage only when continuing
    sessionStorage.setItem("solePhoto", capturedImage);
    navigate("/rating");
  };

  // Improved back button handler that always resets the component state correctly
  const handleBackClick = () => {
    console.log("Back button clicked, current state:", { 
      capturedImage: !!capturedImage, 
      isCameraOpen, 
      isLoading 
    });
    
    // Clear the stored photo
    sessionStorage.removeItem("solePhoto");
    
    // Stop the camera and release resources
    stopCamera();
    
    // Force a page refresh to completely reset the component state
    window.location.href = "/photo-capture";
  };

  // Log the current state to help with debugging
  console.log("PhotoCapture render state:", { 
    capturedImage: !!capturedImage, 
    isCameraOpen, 
    isLoading, 
    cameraError: !!cameraError, 
    videoRefExists: !!videoRef.current,
    isPhotoApproved 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <PhotoCaptureHeader onBack={handleBackClick} />

      <div className="max-w-md mx-auto">
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-0">
            {/* Always include the video element but hide it when not in use */}
            <div className={isLoading || !isCameraOpen ? "hidden" : ""}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover bg-black"
              />
            </div>

            {isLoading ? (
              <CameraLoading 
                onCancel={cancelCameraAccess} 
                onManualCapture={uploadPhotoManually}
              />
            ) : isCameraOpen ? (
              <CameraView videoRef={videoRef} onCapture={capturePhoto} />
            ) : capturedImage ? (
              <PhotoPreview 
                capturedImage={capturedImage}
                onRetake={retryCamera}
                onContinue={handleContinue}
                onApprove={approvePhoto}
                isApproved={isPhotoApproved}
              />
            ) : (
              <div className="p-6 text-center">
                {cameraError ? (
                  <CameraError 
                    errorMessage={cameraError}
                    onRetry={retryCamera}
                    onManualCapture={uploadPhotoManually}
                  />
                ) : (
                  <div className="py-10">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-4">Starting camera...</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Moved "Upload Photo Instead" button to below the camera box */}
        {!capturedImage && (
          <Button 
            onClick={uploadPhotoManually}
            variant="outline"
            className="mb-4 w-full flex items-center justify-center"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload photo from device instead
          </Button>
        )}

        {/* Hidden canvas for capturing images */}
        <canvas ref={canvasRef} className="hidden" width="640" height="480"></canvas>
        
        {capturedImage && (
          <Button 
            onClick={handleContinue} 
            className="w-full"
            disabled={!isPhotoApproved}
          >
            Continue
          </Button>
        )}
        
        {cameraError && !capturedImage && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 mb-3">
              Having trouble with the camera? Try one of these options:
            </p>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={uploadPhotoManually} 
                variant="default"
                className="flex items-center justify-center"
              >
                <Upload className="mr-2 h-4 w-4" /> Upload photo from device
              </Button>
              
              <Button
                onClick={retryCamera}
                variant="outline"
                className="flex items-center justify-center"
              >
                <Camera className="mr-2 h-4 w-4" /> Try camera again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
