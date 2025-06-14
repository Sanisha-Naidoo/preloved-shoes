
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
    timestamp: new Date().toISOString(),
    isValidDataUrl: qrCodeDataURL?.startsWith('data:image/')
  });
  
  // Validate inputs
  if (!shoeId?.trim()) {
    throw new Error("Shoe ID is required for QR update");
  }
  
  if (!qrCodeDataURL?.trim() || !qrCodeDataURL.startsWith('data:image/')) {
    throw new Error("Valid QR code data URL is required");
  }
  
  try {
    // Step 1: Verify the shoe exists
    console.log("🔍 Step 1: Verifying shoe exists...");
    const { data: existingShoe, error: checkError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();

    if (checkError) {
      console.error("❌ Shoe verification failed:", checkError);
      throw new Error(`Failed to verify shoe exists: ${checkError.message}`);
    }

    if (!existingShoe) {
      throw new Error("Shoe not found in database");
    }

    console.log("✅ Shoe verified:", {
      id: existingShoe.id,
      hasExistingQr: !!existingShoe.qr_code
    });

    // Step 2: Perform the update
    console.log("🎯 Step 2: Executing QR update...");
    const { error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId);

    if (updateError) {
      console.error("❌ Update failed:", updateError);
      throw new Error(`Update failed: ${updateError.message}`);
    }

    console.log("📊 Update executed successfully");

    // Step 3: Verify the update was successful
    console.log("🔍 Step 3: Verifying update was successful...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("shoes")
      .select("qr_code")
      .eq("id", shoeId)
      .single();

    if (verifyError) {
      console.error("❌ Verification failed:", verifyError);
      throw new Error(`Update verification failed: ${verifyError.message}`);
    }

    if (!verifyData?.qr_code) {
      console.error("❌ QR code not found after update");
      throw new Error("QR code was not saved properly - verification failed");
    }

    // Step 4: Validate the saved QR code matches what we sent
    const qrCodeMatches = verifyData.qr_code === qrCodeDataURL;
    console.log("✅ QR code update verified successfully:", {
      hasQrCode: !!verifyData.qr_code,
      qrCodeLength: verifyData.qr_code?.length,
      dataMatches: qrCodeMatches
    });

    if (!qrCodeMatches) {
      console.warn("⚠️ Saved QR code doesn't match sent data");
    }

    console.log("🎉 QR code update completed successfully");
    return true;

  } catch (error: any) {
    console.error("💥 QR UPDATE FAILED:", {
      error: error.message,
      stack: error.stack,
      shoeId,
      qrLength: qrCodeDataURL?.length,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
