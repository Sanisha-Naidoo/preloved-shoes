
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Barcode, QrCode, Camera, ArrowRight, Check } from "lucide-react";
import BarcodeScanner from "@/components/BarcodeScanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const OptionalBarcodeScan = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [codeType, setCodeType] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [shoeDetails, setShoeDetails] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);

  // Check if we already have shoe details
  useEffect(() => {
    const storedDetails = sessionStorage.getItem("shoeDetails");
    if (storedDetails) {
      const details = JSON.parse(storedDetails);
      setShoeDetails(details);
    }
  }, []);

  useEffect(() => {
    if (scannedValue) {
      lookupCode(scannedValue, codeType || 'barcode');
    }
  }, [scannedValue]);

  const startScanning = () => {
    setScanning(true);
    setScannedValue(null);
    setCodeType(null);
    setNoMatchFound(false);
    setScanAttempts(prev => prev + 1);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const handleCodeDetected = (value: string, type: string) => {
    console.log(`${type.toUpperCase()} detected:`, value);
    setScannedValue(value);
    setCodeType(type);
    setLookingUp(true);
    stopScanning();
    
    const codeTypeDisplay = type === 'qrcode' ? 'QR Code' : 'Barcode';
    toast.success(`${codeTypeDisplay} detected!`, {
      id: "code-detected",
      duration: 2000,
    });
  };

  const lookupCode = async (code: string, type: string) => {
    try {
      console.log(`Looking up ${type}:`, code);
      
      // Handle URLs in QR codes differently
      const isUrl = code.startsWith('http');
      let query;
      
      if (isUrl) {
        console.log("Detected URL in code:", code);
        // For URLs, we'll try to extract identifiers or query params
        // Example: extract Nike product ID from Nike app link
        if (code.includes('nike.app.link')) {
          // Try to query based on partial match (better would be to extract product ID)
          query = supabase
            .from("shoes")
            .select("*")
            .ilike("model", "%nike%")
            .maybeSingle();
        } else {
          // Default URL handling - just search for the full URL
          query = supabase
            .from("shoes")
            .select("*")
            .eq("barcode", code)
            .maybeSingle();
        }
      } else {
        // Regular barcode lookup
        query = supabase
          .from("shoes")
          .select("*")
          .eq("barcode", code)
          .maybeSingle();
      }

      const { data, error } = await query;

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // Update session storage with barcode data
      if (shoeDetails) {
        const updatedDetails = {...shoeDetails, barcode: code};
        setShoeDetails(updatedDetails);
        sessionStorage.setItem("shoeDetails", JSON.stringify(updatedDetails));
        toast.success("Barcode information saved!");
        
        // Navigate to submit page
        setTimeout(() => {
          navigate("/submit");
        }, 1500);
      } else {
        setNoMatchFound(true);
      }
    } catch (error) {
      console.error(`Error looking up ${type}:`, error);
      setNoMatchFound(true);
    } finally {
      setLookingUp(false);
    }
  };

  const handleSkip = () => {
    navigate("/submit");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Optional: Scan Barcode</h1>
        <p className="text-gray-600 mb-6">
          You can scan a barcode or QR code to add more information about your shoe, or skip this step.
        </p>

        <Card className="overflow-hidden mb-6">
          <CardContent className="p-0">
            {scanning ? (
              <div className="relative">
                <BarcodeScanner key={`scanner-${scanAttempts}`} onDetected={handleCodeDetected} />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 text-center">
                  <p className="text-sm">
                    Align the barcode or QR code within the scanner area
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                {lookingUp ? (
                  <div className="py-12 px-6 text-center">
                    <div className="animate-pulse mb-4">
                      {codeType === 'qrcode' ? (
                        <QrCode className="h-12 w-12 mx-auto text-gray-400" />
                      ) : (
                        <Barcode className="h-12 w-12 mx-auto text-gray-400" />
                      )}
                    </div>
                    <p className="text-lg font-medium">Processing barcode...</p>
                  </div>
                ) : noMatchFound ? (
                  <div className="py-12 px-6 text-center">
                    <p className="text-lg font-medium mb-6">
                      Barcode information saved!
                    </p>
                    <Button onClick={() => navigate("/submit")} className="w-full">
                      Continue to Submit
                    </Button>
                  </div>
                ) : (
                  <div className="py-12 px-6 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-6">Ready to scan barcode</p>
                    <Button onClick={startScanning} className="w-full mb-4">
                      Start Scanning
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center" 
          onClick={handleSkip}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Skip and Continue
        </Button>
      </div>
    </div>
  );
};

export default OptionalBarcodeScan;
