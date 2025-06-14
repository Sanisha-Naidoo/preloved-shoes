
import { supabase } from "@/integrations/supabase/client";
import { logStep } from "./submissionLogger";

export interface ShoeData {
  brand: string;
  model?: string;
  size: string;
  sizeUnit: string;
  condition: string;
  barcode?: string;
  rating: number | null;
  photoUrl: string;
}

export const createShoeRecord = async (data: ShoeData): Promise<string> => {
  logStep("Saving shoe data to database");
  const { data: shoeData, error: shoeError } = await supabase
    .from("shoes")
    .insert([
      {
        brand: data.brand,
        model: data.model || null,
        size: data.size,
        size_unit: data.sizeUnit,
        condition: data.condition,
        barcode: data.barcode || null,
        rating: data.rating,
        photo_url: data.photoUrl,
        sole_photo_url: data.photoUrl,
      },
    ])
    .select();

  if (shoeError) {
    logStep("Error saving shoe data", shoeError);
    throw shoeError;
  }

  if (!shoeData || shoeData.length === 0) {
    logStep("No shoe data returned after insert");
    throw new Error("Failed to create shoe record");
  }

  logStep("Shoe data saved successfully", { shoeId: shoeData[0].id });
  return shoeData[0].id;
};

export const updateShoeWithQRCode = async (shoeId: string, qrCodeDataURL: string): Promise<boolean> => {
  console.log("🔥 STARTING QR UPDATE", { 
    shoeId, 
    qrLength: qrCodeDataURL?.length,
    qrSizeKB: Math.round(qrCodeDataURL?.length / 1024),
    timestamp: new Date().toISOString()
  });
  
  // Validate inputs
  if (!shoeId?.trim()) {
    throw new Error("Shoe ID is required for QR update");
  }
  
  if (!qrCodeDataURL?.trim()) {
    throw new Error("QR code data is required for update");
  }
  
  try {
    // Direct update with proper error handling
    console.log("🎯 Updating QR code directly...");
    
    const { error: updateError, count } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId);

    if (updateError) {
      console.error("❌ QR update failed:", updateError);
      throw new Error(`QR code update failed: ${updateError.message}`);
    }

    // Check if any records were updated
    if (count === 0) {
      console.error("❌ No records updated - checking if shoe exists...");
      
      // Verify the shoe exists
      const { data: existingShoe, error: fetchError } = await supabase
        .from("shoes")
        .select("id")
        .eq("id", shoeId)
        .single();

      if (fetchError || !existingShoe) {
        throw new Error(`Shoe record not found with ID: ${shoeId}`);
      }
      
      // If shoe exists but wasn't updated, try again
      console.log("🔄 Shoe exists, retrying update...");
      const { error: retryError } = await supabase
        .from("shoes")
        .update({ qr_code: qrCodeDataURL })
        .eq("id", shoeId);
        
      if (retryError) {
        throw new Error(`QR code retry update failed: ${retryError.message}`);
      }
    }

    // Verify the update was successful by fetching the record
    console.log("🔍 Verifying QR code was saved...");
    const { data: updatedShoe, error: verifyError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();

    if (verifyError) {
      console.error("❌ Verification failed:", verifyError);
      throw new Error(`Failed to verify QR code save: ${verifyError.message}`);
    }

    if (!updatedShoe?.qr_code) {
      throw new Error("QR code field is still empty after update");
    }

    console.log("🎉 QR code successfully saved and verified", {
      shoeId: updatedShoe.id,
      qrCodeLength: updatedShoe.qr_code.length,
      matches: updatedShoe.qr_code === qrCodeDataURL
    });

    return true;

  } catch (error: any) {
    console.error("💥 QR UPDATE PROCESS FAILED:", {
      error: error.message,
      stack: error.stack,
      shoeId,
      qrLength: qrCodeDataURL?.length
    });
    throw error;
  }
};
