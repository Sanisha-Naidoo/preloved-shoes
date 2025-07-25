import { supabase } from "@/integrations/supabase/client";
import { logStep } from "./submissionLogger";

export interface ShoeData {
  brand: string;
  model?: string;
  size: string;
  sizeUnit: string;
  condition: string;
  rating: number | null;
  photoUrl: string | null;
}

// Helper function to call the edge function
const callPrelovedDB = async (operation: string, data: any) => {
  const { data: result, error } = await supabase.functions.invoke('preloved-db', {
    body: { operation, data }
  });
  
  if (error) throw error;
  return result;
};

// Updated to work without authentication - user_id is now optional
export const createShoeRecord = async (data: ShoeData, userId?: string): Promise<{ shoeId: string }> => {
  logStep("Creating shoe record");
  
  try {
    const result = await callPrelovedDB('create_shoe', {
      brand: data.brand,
      model: data.model,
      size: data.size,
      sizeUnit: data.sizeUnit,
      condition: data.condition,
      rating: data.rating,
      photoUrl: data.photoUrl,
      userId
    });

    if (!result?.shoeId) {
      logStep("No shoe data returned after insert");
      throw new Error("Failed to create shoe record");
    }

    logStep("Shoe data saved successfully", { shoeId: result.shoeId });
    return { shoeId: result.shoeId };

  } catch (error: any) {
    logStep("Failed to create shoe record", error);
    throw error;
  }
};

export const updateShoeWithQRCode = async (shoeId: string, qrCodeDataURL: string): Promise<boolean> => {
  console.log("🔥 Starting QR code update", { shoeId, qrCodeSize: qrCodeDataURL?.length });
  
  if (!shoeId?.trim()) {
    throw new Error("Shoe ID is required for QR update");
  }
  if (!qrCodeDataURL?.trim()) {
    throw new Error("QR code data is required for update");
  }
  if (!qrCodeDataURL.startsWith('data:image/')) {
    throw new Error("Invalid QR code format for database storage");
  }

  try {
    console.log("💾 Updating QR code in database...");
    
    const result = await callPrelovedDB('update_qr_code', {
      shoeId,
      qrCodeDataURL
    });

    if (!result?.qr_code) {
      // Check if shoe exists
      const existsResult = await callPrelovedDB('check_shoe_exists', { shoeId });
      
      if (!existsResult?.exists) {
        throw new Error(`Shoe record not found: ${shoeId}`);
      }
      
      throw new Error(`QR code update failed for shoe: ${shoeId}`);
    }

    console.log("🎉 QR code successfully saved", { 
      id: shoeId, 
      qrCodeLength: result.qr_code.length 
    });
    logStep("QR code saved to database successfully", { 
      shoeId, 
      qrCodeLength: result.qr_code.length 
    });
    return true;

  } catch (error: any) {
    console.error("💥 QR code update failed:", error);
    logStep("QR code database update failed", { shoeId, error: error.message });
    throw error;
  }
};