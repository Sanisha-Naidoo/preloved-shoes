import { supabase } from "@/integrations/supabase/client";
import { logStep } from "./submissionLogger";

export interface ShoeData {
  brand: string;
  model?: string;
  size: string;
  sizeUnit: string;
  condition: string;
  rating: number | null;
  photoUrl: string;
}

export const createShoeRecord = async (data: ShoeData): Promise<{ shoeId: string }> => {
  logStep("Creating shoe record");
  
  try {
    // Create the shoe record
    const { data: shoeData, error: shoeError } = await supabase
      .from("shoes")
      .insert([
        {
          brand: data.brand,
          model: data.model || null,
          size: data.size,
          size_unit: data.sizeUnit,
          condition: data.condition,
          rating: data.rating,
          photo_url: data.photoUrl,
          sole_photo_url: data.photoUrl,
        },
      ])
      .select()
      .single();

    if (shoeError) {
      logStep("Error saving shoe data", shoeError);
      throw shoeError;
    }

    if (!shoeData) {
      logStep("No shoe data returned after insert");
      throw new Error("Failed to create shoe record");
    }

    const shoeId = shoeData.id;
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
    
    // Use upsert approach to handle any potential issues
    const { data: updateData, error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code")
      .single();

    if (updateError) {
      console.error("❌ QR update failed:", updateError);
      
      // If update fails, try a different approach - check if record exists first
      const { data: existingRecord, error: checkError } = await supabase
        .from("shoes")
        .select("id, qr_code")
        .eq("id", shoeId)
        .single();
        
      if (checkError || !existingRecord) {
        throw new Error(`Shoe record not found or inaccessible: ${checkError?.message || 'Record not found'}`);
      }
      
      // Record exists but update failed - this might be an RLS or transaction issue
      throw new Error(`QR code update failed: ${updateError.message}`);
    }

    if (!updateData) {
      throw new Error("Update operation returned no data");
    }

    const hasQrCode = !!updateData.qr_code;
    
    if (hasQrCode) {
      console.log("🎉 QR code successfully saved", { 
        id: shoeId, 
        qrCodeLength: updateData.qr_code.length 
      });
      logStep("QR code saved to database successfully", { 
        shoeId, 
        qrCodeLength: updateData.qr_code.length 
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
