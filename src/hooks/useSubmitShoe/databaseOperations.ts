
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
    // Add a small delay to ensure the shoe record is fully committed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Step 1: Verify the shoe exists and get current state
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
      throw new Error(`Shoe with ID ${shoeId} not found in database`);
    }

    console.log("✅ Shoe verified:", { 
      id: existingShoe.id, 
      hasExistingQR: !!existingShoe.qr_code 
    });

    // Step 2: Perform the QR code update with retry logic
    console.log("🎯 Step 2: Updating QR code with retry...");
    let updateResult = null;
    let updateError = null;
    
    // Try update up to 3 times with increasing delays
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`📝 Update attempt ${attempt}/3...`);
      
      const { data, error } = await supabase
        .from("shoes")
        .update({ qr_code: qrCodeDataURL })
        .eq("id", shoeId)
        .select("id, qr_code");

      if (!error && data && data.length > 0) {
        updateResult = data;
        updateError = null;
        break;
      }
      
      updateError = error;
      console.warn(`❌ Update attempt ${attempt} failed:`, error || "No rows affected");
      
      if (attempt < 3) {
        // Wait longer between retries
        await new Promise(resolve => setTimeout(resolve, attempt * 200));
      }
    }

    if (updateError) {
      console.error("❌ All QR update attempts failed:", updateError);
      throw new Error(`QR code update failed after 3 attempts: ${updateError.message}`);
    }

    if (!updateResult || updateResult.length === 0) {
      console.error("❌ No rows were updated after all attempts");
      throw new Error("Update executed but no rows affected after 3 attempts - shoe may not exist");
    }

    const updatedShoe = updateResult[0];
    console.log("✅ QR code update completed:", {
      shoeId: updatedShoe.id,
      hasQrCode: !!updatedShoe.qr_code,
      qrCodeLength: updatedShoe.qr_code?.length || 0
    });

    // Step 3: Verify the QR code was saved correctly
    if (!updatedShoe.qr_code) {
      console.error("❌ QR code not found in update result");
      throw new Error("QR code was not saved - update result shows empty field");
    }

    if (updatedShoe.qr_code !== qrCodeDataURL) {
      console.error("❌ QR code data mismatch after save");
      throw new Error("QR code data corrupted during save");
    }

    console.log("🎉 QR code successfully saved and verified", {
      savedLength: updatedShoe.qr_code.length,
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
