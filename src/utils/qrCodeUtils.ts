
import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    console.log("Generating QR code for data:", data);
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log("QR code generated successfully:", {
      dataLength: qrCodeDataURL.length,
      dataPreview: qrCodeDataURL.substring(0, 50) + "...",
      originalData: data
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateShoeQRData = (shoeId: string): string => {
  // Create a URL or identifier that can be used to look up the shoe
  const baseUrl = window.location.origin;
  const qrData = `${baseUrl}/shoe/${shoeId}`;
  
  console.log("Generated QR data:", {
    shoeId,
    baseUrl,
    qrData
  });
  
  return qrData;
};
