
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
    // Step 1: Verify the shoe exists first
    console.log("🔍 Step 1: Verifying shoe exists...");
    const { data: existingShoe, error: checkError } = await supabase
      .from("shoes")
      .select("id")
      .eq("id", shoeId)
      .single();

    if (checkError) {
      console.error("❌ Shoe verification failed:", checkError);
      throw new Error(`Failed to verify shoe exists: ${checkError.message}`);
    }

    if (!existingShoe) {
      throw new Error("Shoe not found in database");
    }

    console.log("✅ Shoe verified:", existingShoe.id);

    // Step 2: Perform the QR code update
    console.log("🎯 Step 2: Updating QR code...");
    const { error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId);

    if (updateError) {
      console.error("❌ QR update failed:", updateError);
      throw new Error(`QR code update failed: ${updateError.message}`);
    }

    console.log("✅ QR code update completed");

    // Step 3: Verify the update was successful
    console.log("🔍 Step 3: Verifying QR code was saved...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("shoes")
      .select("qr_code")
      .eq("id", shoeId)
      .single();

    if (verifyError) {
      console.error("❌ Verification failed:", verifyError);
      throw new Error(`QR code verification failed: ${verifyError.message}`);
    }

    if (!verifyData?.qr_code) {
      console.error("❌ QR code not found after update");
      throw new Error("QR code was not saved - verification shows empty field");
    }

    if (verifyData.qr_code !== qrCodeDataURL) {
      console.error("❌ QR code data mismatch after save");
      throw new Error("QR code data corrupted during save");
    }

    console.log("🎉 QR code successfully saved and verified", {
      savedLength: verifyData.qr_code.length,
      expectedLength: qrCodeDataURL.length
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
