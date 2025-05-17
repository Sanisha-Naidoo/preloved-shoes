
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Camera } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <PhotoCaptureHeader onBack={handleBackClick} />

      <div className="max-w-md mx-auto">
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-0">
            {isLoading ? (
              <CameraLoading onCancel={cancelCameraAccess} />
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
                  <div className="py-12">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-6">Starting camera...</p>
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
      </div>
    </div>
  );
};

export default PhotoCapture;
