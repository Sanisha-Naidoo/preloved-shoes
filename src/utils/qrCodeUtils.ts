
import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    console.log("🔍 Starting QR code generation for data:", data);
    
    if (!data || data.trim().length === 0) {
      throw new Error("QR code data cannot be empty");
    }
    
    // Generate QR code with smaller, more conservative settings for testing
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200, // Reduced from 400
      margin: 1,  // Reduced from 2
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'L' // Changed from 'M' to 'L' for smaller size
    });
    
    // Validate the generated QR code
    if (!qrCodeDataURL || !qrCodeDataURL.startsWith('data:image/')) {
      throw new Error("Invalid QR code data URL generated");
    }
    
    console.log("✅ QR code generated successfully:", {
      dataLength: qrCodeDataURL.length,
      dataSizeKB: Math.round(qrCodeDataURL.length / 1024),
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
  // Using a simpler format that's more reliable
  const qrData = `SHOE:${shoeId}`;
  
  console.log("✅ Generated QR data:", {
    shoeId,
    qrData,
    qrDataLength: qrData.length
  });
  
  return qrData;
};
