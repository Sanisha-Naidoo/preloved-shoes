
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Circle, Camera, FileText } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasShoeDetails, setHasShoeDetails] = useState(false);
  const [hasSolePhoto, setHasSolePhoto] = useState(false);
  
  // Add haptic feedback for mobile devices
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50ms
    }
  };

  // Check completion status on mount and when returning to page
  useEffect(() => {
    const checkCompletionStatus = () => {
      const shoeDetails = sessionStorage.getItem("shoeDetails");
      const solePhoto = sessionStorage.getItem("solePhoto");
      
      setHasShoeDetails(!!shoeDetails);
      setHasSolePhoto(!!solePhoto);
      
      console.log("Completion status:", {
        hasShoeDetails: !!shoeDetails,
        hasSolePhoto: !!solePhoto
      });
    };

    checkCompletionStatus();
    
    // Check status when user returns to the page (in case they used browser back button)
    const handleFocus = () => checkCompletionStatus();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  // Show install prompt when applicable
  useEffect(() => {
    let deferredPrompt: any;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      
      // Show your custom install button if needed
      const installButton = document.getElementById('install-button');
      if (installButton) {
        installButton.style.display = 'block';
        
        installButton.addEventListener('click', () => {
          // Show the install prompt
          deferredPrompt.prompt();
          
          // Wait for the user to respond to the prompt
          deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the A2HS prompt');
              toast({
                title: "App installed successfully!",
                description: "You can now access Reboot from your home screen."
              });
            } else {
              console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
            
            // Hide the install button
            installButton.style.display = 'none';
          });
        });
      }
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  const handleSubmit = () => {
    if (!hasShoeDetails || !hasSolePhoto) {
      if (!hasShoeDetails) {
        toast({
          title: "Missing shoe details",
          description: "Please enter your shoe details first.",
          variant: "destructive"
        });
      } else if (!hasSolePhoto) {
        toast({
          title: "Missing photo",
          description: "Please take a photo of your shoe sole first.",
          variant: "destructive"
        });
      }
      return;
    }
    
    triggerHapticFeedback();
    navigate('/submit');
  };

  const canSubmit = hasShoeDetails && hasSolePhoto;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col">
      <header className="px-4 text-center py-[16px]">
        <div className="mx-auto mb-12 py-[8px]">
          <div className="bg-white rounded-2xl shadow-sm p-6 mx-auto w-64 h-64 flex items-center justify-center">
            <AspectRatio ratio={1/1} className="w-full h-full">
              <img 
                src="/lovable-uploads/ba6fcc1a-24b1-4e24-8750-43bdc56bb2fb.png" 
                alt="Reboot Logo" 
                className="h-full w-full object-contain"
                loading="eager" 
              />
            </AspectRatio>
          </div>
        </div>
        <h1 className="font-bold mb-2 text-4xl">Reboot</h1>
        <p className="text-gray-600">Beta</p>
      </header>

      <div className="flex-grow flex items-center justify-center p-4 px-[8px] py-[8px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Complete the steps below to submit your shoe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress indicators */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                {hasShoeDetails ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className={`text-sm ${hasShoeDetails ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                    Shoe Details {hasShoeDetails ? 'Complete' : 'Required'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                {hasSolePhoto ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-gray-600" />
                  <span className={`text-sm ${hasSolePhoto ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                    Sole Photo {hasSolePhoto ? 'Complete' : 'Required'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <Button 
              onClick={() => {
                triggerHapticFeedback();
                navigate('/manual-entry');
              }} 
              variant={hasShoeDetails ? "outline" : "default"}
              className="w-full mb-4 h-14 text-base"
            >
              {hasShoeDetails ? 'Edit' : 'Enter'} Shoe Details
            </Button>

            {hasShoeDetails && (
              <Button 
                onClick={() => {
                  triggerHapticFeedback();
                  navigate('/photo-capture');
                }} 
                variant={hasSolePhoto ? "outline" : "default"}
                className="w-full mb-4 h-14 text-base"
              >
                {hasSolePhoto ? 'Retake' : 'Take'} Sole Photo
              </Button>
            )}
            
            {/* Submit button - only show when at least one step is complete */}
            {(hasShoeDetails || hasSolePhoto) && (
              <Button 
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full h-14 text-base font-semibold"
                variant={canSubmit ? "default" : "secondary"}
              >
                {canSubmit ? 'Submit for Review' : 'Complete All Steps to Submit'}
              </Button>
            )}
            
            {/* Install button for PWA - hidden by default */}
            <Button 
              id="install-button"
              variant="outline" 
              className="w-full h-14 text-base mt-8 hidden"
            >
              Install App
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
