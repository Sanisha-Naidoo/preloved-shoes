
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Camera, Upload, Check } from "lucide-react";

const PhotoCapture = () => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        stopCamera();
        
        // Store the image in session storage
        sessionStorage.setItem("solePhoto", imageDataUrl);
      }
    }
  };

  const handleContinue = () => {
    if (!capturedImage) {
      toast.error("Please capture a photo of the sole before continuing.");
      return;
    }
    
    navigate("/rating");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Capture Sole Photo</h1>
        <p className="text-gray-600 mb-6">
          Take a clear photo of the sole of your shoe. Hold your phone about 30cm away for best results.
        </p>

        <Card className="overflow-hidden mb-6">
          <CardContent className="p-0">
            {isCameraOpen ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                {/* Guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white border-dashed rounded-lg w-4/5 h-4/5 flex items-center justify-center">
                    <p className="text-white bg-black/50 px-3 py-1 rounded text-sm">
                      Center the sole here
                    </p>
                  </div>
                </div>
                {/* Capture button */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Button 
                    onClick={capturePhoto} 
                    className="rounded-full h-14 w-14 p-0 flex items-center justify-center"
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            ) : capturedImage ? (
              <div className="relative">
                <img src={capturedImage} alt="Captured sole" className="w-full h-64 object-contain" />
                <div className="absolute top-2 right-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="rounded-full h-8 w-8 p-0"
                    onClick={() => {
                      setCapturedImage(null);
                      startCamera();
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="rounded-full h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="py-12">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-6">Ready to take a photo</p>
                  <Button onClick={startCamera} className="w-full">
                    Open Camera
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden canvas for capturing images */}
        <canvas ref={canvasRef} className="hidden"></canvas>

        <Button onClick={handleContinue} className="w-full" disabled={!capturedImage}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default PhotoCapture;
