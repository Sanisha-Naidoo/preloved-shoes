
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

  // Check if data URL is too large (PostgreSQL text field limit is ~1GB, but let's be conservative)
  if (qrCodeDataURL.length > 50000) {
    console.warn("QR code data is very large:", qrCodeDataURL.length, "bytes");
  }
  
  try {
    // First verify the shoe exists
    console.log("🔍 Verifying shoe exists...");
    const { data: existingShoe, error: fetchError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();

    if (fetchError) {
      console.error("❌ Shoe fetch failed:", fetchError);
      throw new Error(`Shoe not found: ${fetchError.message}`);
    }

    if (!existingShoe) {
      throw new Error("Shoe record not found");
    }

    console.log("✅ Shoe exists, current QR code length:", existingShoe.qr_code?.length || 0);

    // Update the QR code with explicit single record targeting
    console.log("🎯 Updating QR code...");
    
    const { data: updateData, error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    if (updateError) {
      console.error("❌ QR update failed:", updateError);
      throw new Error(`QR code update failed: ${updateError.message}`);
    }

    if (!updateData || updateData.length === 0) {
      throw new Error("No records were updated - shoe may not exist");
    }

    const updatedRecord = updateData[0];
    
    // Verify the update was successful
    if (!updatedRecord.qr_code) {
      throw new Error("QR code field is still empty after update");
    }

    if (updatedRecord.qr_code !== qrCodeDataURL) {
      console.error("❌ QR code data mismatch after update", {
        expected: qrCodeDataURL.length,
        actual: updatedRecord.qr_code.length
      });
      throw new Error("QR code data was corrupted during save");
    }

    console.log("🎉 QR code successfully saved and verified", {
      shoeId: updatedRecord.id,
      qrCodeLength: updatedRecord.qr_code.length,
      matches: updatedRecord.qr_code === qrCodeDataURL
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
