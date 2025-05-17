
import { Html5Qrcode } from "html5-qrcode";

// QR code format detector
export const isQRCodeFormat = (format: string): boolean => {
  // QR code format names from the html5-qrcode library
  const qrFormats = ['QR_CODE', 'AZTEC', 'DATA_MATRIX'];
  return qrFormats.some(qrFormat => 
    format.toUpperCase().includes(qrFormat)
  );
};

// Get available camera ID
export const getCameraId = async (): Promise<string | null> => {
  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length) {
      // Prefer back camera if available
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      return backCamera ? backCamera.id : devices[0].id;
    }
    return null;
  } catch (error) {
    console.error("Error getting cameras:", error);
    return null;
  }
};

// Scanner configuration
export const getScannerConfig = () => {
  return {
    fps: 10,
    qrbox: { width: 250, height: 150 },
    aspectRatio: 1.777778,
  } as any; // Type assertion to bypass TypeScript check for formats property
};

