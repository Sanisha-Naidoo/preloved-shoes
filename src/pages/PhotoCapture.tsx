import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Upload, SkipForward } from "lucide-react";
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

  // Fixed back button handler that properly cleans up without breaking submission flow
  const handleBackClick = () => {
    console.log("Back button clicked, cleaning up camera and navigating back");
    
    // Clear only the photo from session storage (preserve shoe details for submission flow)
    sessionStorage.removeItem("solePhoto");
    
    // Stop the camera and release resources
    stopCamera();
    
    // Navigate back to manual entry using React Router (preserves session data)
    navigate("/manual-entry");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col relative overflow-hidden p-4">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.3)_1px,_transparent_0)] bg-[length:32px_32px]"></div>
      {/* Ambient Background Shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-200/15 to-teal-200/15 rounded-full blur-3xl opacity-40"></div>
      <div className="max-w-md mx-auto relative z-10">
        <h1 className="text-2xl font-bold mb-2">Capture Sole Photo</h1>
        <p className="text-gray-600 mb-6">
          Take a clear photo of the sole of your shoe. Hold your phone about 30cm away for best results.
        </p>

        {/* Progress Stepper */}
        <div className="mb-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <Card className="overflow-hidden mb-6 bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl shadow-gray-500/10 rounded-3xl transition-all duration-500 ease-out hover:shadow-3xl hover:shadow-gray-500/15 hover:bg-white/80">
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
              <SkipForward className="mr-2 h-4 w-4" /> Skip photo (optional)
            </Button>
          </div>
        )}

        {/* Hidden canvas for capturing images */}
        <canvas ref={canvasRef} className="hidden" width="640" height="480"></canvas>
        
        {capturedImage && (
          <Button 
            onClick={handleContinue} 
            className="w-full h-14 text-base font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/30 border-0 rounded-2xl button-premium"
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
                <SkipForward className="mr-2 h-4 w-4" /> Skip photo (optional)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
