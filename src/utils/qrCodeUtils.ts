
import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    console.log("🔍 Starting QR code generation for data:", data);
    
    if (!data || data.trim().length === 0) {
      throw new Error("QR code data cannot be empty");
    }
    
    // Generate QR code with optimized settings for database storage
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,    // Smaller size for better database storage
      margin: 1,     // Minimal margin
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'L', // Low error correction for smaller size
      type: 'image/png',
      quality: 0.8
    });
    
    console.log("📝 Raw QR code generated:", {
      dataLength: qrCodeDataURL.length,
      preview: qrCodeDataURL.substring(0, 50) + "..."
    });
    
    // Validate the generated QR code - but be more lenient
    if (!qrCodeDataURL || !qrCodeDataURL.startsWith('data:image/')) {
      console.error("❌ Invalid QR code format:", qrCodeDataURL?.substring(0, 100));
      throw new Error("Invalid QR code data URL generated");
    }
    
    // Check size - warn if getting large
    const sizeKB = Math.round(qrCodeDataURL.length / 1024);
    console.log("✅ QR code generated successfully:", {
      dataLength: qrCodeDataURL.length,
      dataSizeKB: sizeKB,
      isValidDataUrl: qrCodeDataURL.startsWith('data:image/'),
      originalData: data,
      format: qrCodeDataURL.split(';')[0]
    });
    
    if (sizeKB > 50) {
      console.warn("⚠️ Large QR code generated:", sizeKB, "KB - may cause database issues");
    }
    
    // Test that the QR code data contains valid base64 (but don't be too strict about format)
    try {
      const base64Data = qrCodeDataURL.split(',')[1];
      if (base64Data) {
        atob(base64Data); // This will throw if invalid base64
        console.log("✅ QR code base64 validation successful");
      }
    } catch (base64Error) {
      console.warn("⚠️ Base64 validation failed but proceeding:", base64Error);
      // Don't throw here - some valid data URLs might not pass strict validation
    }
    
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
