
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Barcode, QrCode, Camera, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const BarcodeScan = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [codeType, setCodeType] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [shoeDetails, setShoeDetails] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);

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

      if (data) {
        setShoeDetails(data);
        setDialogOpen(true);
      } else {
        console.log(`No match found for ${type}:`, code);
        setNoMatchFound(true);
      }
    } catch (error) {
      console.error(`Error looking up ${type}:`, error);
      setNoMatchFound(true);
    } finally {
      setLookingUp(false);
    }
  };

  const handleConfirmDetails = () => {
    // Store the shoe details in session storage
    sessionStorage.setItem("shoeDetails", JSON.stringify(shoeDetails));
    // Close the dialog
    setDialogOpen(false);
    // Navigate to the photo capture page
    navigate("/photo-capture");
  };

  const handleManualEntry = () => {
    navigate("/manual-entry");
  };

  const handleTryAgain = () => {
    setScannedValue(null);
    setCodeType(null);
    setNoMatchFound(false);
    startScanning();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Scan Code</h1>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {scanning ? (
              <div className="relative">
                <div className="bg-gray-200 h-64 flex items-center justify-center">
                  <p className="text-gray-500">Scanner component removed</p>
                </div>
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
                    <p className="text-lg font-medium">Looking up your shoe...</p>
                  </div>
                ) : noMatchFound ? (
                  <div className="py-12 px-6 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                    <p className="text-lg font-medium mb-2">
                      Couldn't find a match for{' '}
                      {codeType === 'qrcode' ? 'QR code' : 'barcode'}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      {scannedValue && scannedValue.length > 30
                        ? `${scannedValue.substring(0, 30)}...`
                        : scannedValue}
                    </p>
                    <div className="space-y-4">
                      <Button onClick={handleManualEntry} variant="default" className="w-full">
                        Enter Details Manually
                      </Button>
                      <Button onClick={handleTryAgain} variant="secondary" className="w-full">
                        Try Scanning Again
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 px-6 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-6">Ready to scan code</p>
                    <Button onClick={startScanning} className="w-full">
                      Start Scanning
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for showing shoe details after successful scan */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Shoe Details</DialogTitle>
          </DialogHeader>
          {shoeDetails && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Brand</p>
                  <p className="text-lg">{shoeDetails.brand}</p>
                </div>
                {shoeDetails.model && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Model</p>
                    <p className="text-lg">{shoeDetails.model}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Size</p>
                  <p className="text-lg">{shoeDetails.size}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {codeType === 'qrcode' ? 'QR Code' : 'Barcode'}
                  </p>
                  <p className="text-lg text-ellipsis overflow-hidden">
                    {shoeDetails.barcode || scannedValue}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDetails}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarcodeScan;
