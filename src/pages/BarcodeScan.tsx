
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Barcode, Camera, AlertCircle } from "lucide-react";
import BarcodeScanner from "@/components/BarcodeScanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const BarcodeScan = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [shoeDetails, setShoeDetails] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);

  useEffect(() => {
    if (scannedValue) {
      lookupBarcode(scannedValue);
    }
  }, [scannedValue]);

  const startScanning = () => {
    setScanning(true);
    setScannedValue(null);
    setNoMatchFound(false);
    setScanAttempts(prev => prev + 1);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const handleBarcodeDetected = (value: string) => {
    console.log("Barcode detected:", value);
    setScannedValue(value);
    setLookingUp(true);
    stopScanning();
    toast.success(`Barcode detected: ${value}`, {
      id: "barcode-detected",
      duration: 2000,
    });
  };

  const lookupBarcode = async (barcode: string) => {
    try {
      console.log("Looking up barcode:", barcode);
      // Query the Supabase shoes table for the barcode
      const { data, error } = await supabase
        .from("shoes")
        .select("*")
        .eq("barcode", barcode)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setShoeDetails(data);
        setDialogOpen(true);
      } else {
        console.log("No match found for barcode:", barcode);
        setNoMatchFound(true);
      }
    } catch (error) {
      console.error("Error looking up barcode:", error);
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
        <h1 className="text-2xl font-bold mb-6">Scan Barcode</h1>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {scanning ? (
              <div className="relative">
                <BarcodeScanner key={`scanner-${scanAttempts}`} onDetected={handleBarcodeDetected} />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 text-center">
                  <p className="text-sm">
                    Align the barcode within the scanner area
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                {lookingUp ? (
                  <div className="py-12 px-6 text-center">
                    <div className="animate-pulse mb-4">
                      <Barcode className="h-12 w-12 mx-auto text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">Looking up your shoe...</p>
                  </div>
                ) : noMatchFound ? (
                  <div className="py-12 px-6 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                    <p className="text-lg font-medium mb-6">
                      Couldn't find a match for barcode: {scannedValue}
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
                    <p className="text-lg font-medium mb-6">Ready to scan barcode</p>
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
                  <p className="text-sm font-medium text-gray-500">Barcode</p>
                  <p className="text-lg">{shoeDetails.barcode || scannedValue}</p>
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
