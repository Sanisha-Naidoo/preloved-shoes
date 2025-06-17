
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Upload, Skip } from "lucide-react";
import { useStepperProgress } from "@/hooks/useStepperProgress";
import { Stepper } from "@/components/ui/stepper";

// Import our components
import { PhotoCaptureHeader } from "@/features/photo-capture/components/PhotoCaptureHeader";
import { CameraView } from "@/features/photo-capture/components/CameraView";
import { PhotoPreview } from "@/features/photo-capture/components/PhotoPreview";
import { CameraError } from "@/features/photo-capture/components/CameraError";
import { CameraLoading } from "@/features/photo-capture/components/CameraLoading";
import { useCamera } from "@/features/photo-capture/hooks/useCamera";

const PhotoCapture = () => {
  const navigate = useNavigate();
  const { steps, currentStep } = useStepperProgress();
  const {
    capturedImage,
    isCameraOpen,
    isLoading,
    cameraError,
    videoRef,
    canvasRef,
    capturePhoto,
    deletePhoto,
    retryCamera,
    cancelCameraAccess,
    uploadPhotoManually,
    stopCamera,
  } = useCamera();

  const handleContinue = () => {
    // Save the image to session storage only when continuing (if there is one)
    if (capturedImage) {
      sessionStorage.setItem("solePhoto", capturedImage);
    } else {
      // Clear any existing photo if skipping
      sessionStorage.removeItem("solePhoto");
    }
    navigate("/rating");
  };

  const handleSkipPhoto = () => {
    console.log("Skipping photo capture");
    
    // Clear any stored photo
    sessionStorage.removeItem("solePhoto");
    
    // Stop the camera and release resources
    stopCamera();
    
    // Navigate to rating
    navigate("/rating");
    toast.info("Photo skipped - you can continue without a photo");
  };

  // Fixed back button handler that properly resets the component state
  const handleBackClick = () => {
    console.log("Back button clicked, cleaning up and navigating away");
    
    // Clear the stored photo
    sessionStorage.removeItem("solePhoto");
    
    // Stop the camera and release resources
    stopCamera();
    
    // Use window.location.reload() to force a complete refresh
    // This ensures a clean state when the user returns to this page
    window.location.reload();
    
    // After reload completes, navigate to home
    // This won't execute immediately due to the reload
    navigate("/");
  };

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
        {/* Progress Stepper */}
        <div className="mb-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

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
                onDelete={deletePhoto}
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
          <div className="space-y-3 mb-4">
            <Button 
              onClick={uploadPhotoManually}
              variant="outline"
              className="w-full flex items-center justify-center"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload photo from device
            </Button>
            
            <Button 
              onClick={handleSkipPhoto}
              variant="secondary"
              className="w-full flex items-center justify-center"
            >
              <Skip className="mr-2 h-4 w-4" /> Skip photo (optional)
            </Button>
          </div>
        )}

        {/* Hidden canvas for capturing images */}
        <canvas ref={canvasRef} className="hidden" width="640" height="480"></canvas>
        
        {capturedImage && (
          <Button 
            onClick={handleContinue} 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
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
              
              <Button
                onClick={handleSkipPhoto}
                variant="secondary"
                className="flex items-center justify-center"
              >
                <Skip className="mr-2 h-4 w-4" /> Skip photo (optional)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
