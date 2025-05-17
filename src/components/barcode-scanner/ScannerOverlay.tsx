
import React from "react";
import { QrCode, Barcode } from "lucide-react";

interface ScannerOverlayProps {
  scanning: boolean;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ scanning }) => {
  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="border-2 border-white/50 m-8 rounded"></div>
        <div className="absolute w-full h-1 bg-red-500/70 animate-pulse"></div>
      </div>
      {scanning && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 flex items-center justify-center space-x-2">
          <QrCode className="h-4 w-4 text-white/70" />
          <Barcode className="h-4 w-4 text-white/70" />
          <p className="text-sm">
            Align the code within the scanner area
          </p>
        </div>
      )}
    </>
  );
};

export default ScannerOverlay;
