
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Add haptic feedback for mobile devices
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50ms
    }
  };
  
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
            <CardDescription>Enter your shoe details to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => {
                triggerHapticFeedback();
                navigate('/manual-entry');
              }} 
              className="w-full mb-4 h-14 text-base"
            >
              Enter Shoe Details
            </Button>
            
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
