
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
    videoRef,
    canvasRef,
    capturePhoto,
    retryCamera,
    cancelCameraAccess,
    uploadPhotoManually,
  } = useCamera();

  const handleContinue = () => {
    if (!capturedImage) {
      toast.error("Please capture a photo of the sole before continuing.");
      return;
    }
    
    navigate("/rating");
  };

  const handleBackClick = () => navigate(-1);

  // Log the current state to help with debugging
  console.log("PhotoCapture render state:", { 
    capturedImage: !!capturedImage, 
    isCameraOpen, 
    isLoading, 
    cameraError: !!cameraError, 
    videoRefExists: !!videoRef.current 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <PhotoCaptureHeader onBack={handleBackClick} />

      <div className="max-w-md mx-auto">
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-0">
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
                    
                    <Button 
                      onClick={uploadPhotoManually}
                      variant="default"
                      className="mx-auto"
                    >
                      <Upload className="mr-2 h-4 w-4" /> Upload Photo Instead
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden canvas for capturing images */}
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        {capturedImage && (
          <Button onClick={handleContinue} className="w-full">
            Continue
          </Button>
        )}
        
        {cameraError && !capturedImage && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Having trouble with the camera? Try uploading a photo instead.
          </p>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
