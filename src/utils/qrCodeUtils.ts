
import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    console.log("🔍 Starting QR code generation for data:", data);
    
    if (!data || data.trim().length === 0) {
      throw new Error("QR code data cannot be empty");
    }
    
    // Generate QR code with optimized settings for database storage
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 256,    // Reasonable size
      margin: 1,     // Minimal margin
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'L', // Low error correction for smaller size
      type: 'image/png',         // PNG is more efficient than default
      quality: 0.8               // Good quality but not maximum
    });
    
    // Validate the generated QR code
    if (!qrCodeDataURL || !qrCodeDataURL.startsWith('data:image/')) {
      throw new Error("Invalid QR code data URL generated");
    }
    
    // Check size - warn if getting large
    const sizeKB = Math.round(qrCodeDataURL.length / 1024);
    if (sizeKB > 20) {
      console.warn("Large QR code generated:", sizeKB, "KB");
    }
    
    console.log("✅ QR code generated successfully:", {
      dataLength: qrCodeDataURL.length,
      dataSizeKB: sizeKB,
      isValidDataUrl: qrCodeDataURL.startsWith('data:image/'),
      originalData: data
    });
    
    return qrCodeDataURL;
  } catch (error: any) {
    console.error('❌ Error generating QR code:', {
      error: error.message,
      stack: error.stack,
      inputData: data
    });
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

export const generateShoeQRData = (shoeId: string): string => {
  console.log("📝 Generating QR data for shoe ID:", shoeId);
  
  if (!shoeId || shoeId.trim().length === 0) {
    throw new Error("Shoe ID is required for QR data generation");
  }
  
  // Create a simple identifier that can be used to look up the shoe
  const qrData = `SHOE:${shoeId}`;
  
  console.log("✅ Generated QR data:", {
    shoeId,
    qrData,
    qrDataLength: qrData.length
  });
  
  return qrData;
};
