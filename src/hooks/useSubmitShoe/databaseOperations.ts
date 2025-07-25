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

// Helper function for raw SQL queries
const executeRawSQL = async (query: string, params: any[] = []) => {
  const { data, error } = await supabase
    .rpc('exec_sql', { sql: query, params });
  
  if (error) throw error;
  return data;
};

// Updated to work without authentication - user_id is now optional
export const createShoeRecord = async (data: ShoeData, userId?: string): Promise<{ shoeId: string }> => {
  logStep("Creating shoe record");
  
  try {
    // Create the shoe record with optional user_id and photoUrl using raw SQL
    const result = await executeRawSQL(`
      INSERT INTO preloved.shoes (brand, model, size, size_unit, condition, rating, photo_url, sole_photo_url, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      data.brand,
      data.model || null,
      data.size,
      data.sizeUnit,
      data.condition,
      data.rating,
      data.photoUrl,
      data.photoUrl,
      userId || null
    ]);

    if (!result || !result[0]?.id) {
      logStep("No shoe data returned after insert");
      throw new Error("Failed to create shoe record");
    }

    const shoeId = result[0].id;
    logStep("Shoe data saved successfully", { shoeId });

    return { shoeId };

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
    
    // Update QR code using raw SQL
    const updateResult = await executeRawSQL(`
      UPDATE preloved.shoes 
      SET qr_code = $1 
      WHERE id = $2 
      RETURNING id, qr_code
    `, [qrCodeDataURL, shoeId]);

    if (!updateResult || updateResult.length === 0) {
      // Try to check if record exists
      const existsResult = await executeRawSQL(`
        SELECT id FROM preloved.shoes WHERE id = $1
      `, [shoeId]);
      
      if (!existsResult || existsResult.length === 0) {
        throw new Error(`Shoe record not found: ${shoeId}`);
      }
      
      throw new Error(`QR code update failed for shoe: ${shoeId}`);
    }

    const updatedRecord = updateResult[0];
    const hasQrCode = !!updatedRecord.qr_code;
    
    if (hasQrCode) {
      console.log("🎉 QR code successfully saved", { 
        id: shoeId, 
        qrCodeLength: updatedRecord.qr_code.length 
      });
      logStep("QR code saved to database successfully", { 
        shoeId, 
        qrCodeLength: updatedRecord.qr_code.length 
      });
      return true;
    } else {
      throw new Error("QR code field is still empty after update");
    }

  } catch (error: any) {
    console.error("💥 QR code update failed:", error);
    logStep("QR code database update failed", { shoeId, error: error.message });
    throw error;
  }
};