
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
    // Step 1: Update the QR code
    console.log("🎯 Updating QR code directly...");
    
    const { error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId);

    if (updateError) {
      console.error("❌ QR update failed:", updateError);
      throw new Error(`QR code update failed: ${updateError.message}`);
    }

    console.log("✅ QR update completed, waiting before verification...");
    
    // Step 2: Wait a moment for the database to commit the transaction
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Verify the update was successful
    console.log("🔍 Verifying QR code was saved...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();

    if (verifyError) {
      console.error("❌ Verification failed:", verifyError);
      throw new Error(`Failed to verify QR code save: ${verifyError.message}`);
    }

    if (!verifyData) {
      throw new Error("Shoe record not found during verification");
    }

    if (!verifyData.qr_code) {
      console.error("❌ QR code still empty after update and delay");
      // Try one more update with a longer QR code to test if it's a data issue
      console.log("🔄 Attempting retry with explicit transaction...");
      
      const { error: retryError } = await supabase
        .from("shoes")
        .update({ qr_code: qrCodeDataURL })
        .eq("id", shoeId);
        
      if (retryError) {
        throw new Error(`Retry update failed: ${retryError.message}`);
      }
      
      // Wait longer for retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check again
      const { data: retryData, error: retryCheckError } = await supabase
        .from("shoes")
        .select("id, qr_code")
        .eq("id", shoeId)
        .single();
        
      if (retryCheckError || !retryData?.qr_code) {
        throw new Error("QR code was not saved - database update not persisting");
      }
      
      console.log("✅ QR code saved on retry");
      return true;
    }

    if (verifyData.qr_code !== qrCodeDataURL) {
      throw new Error("QR code data corrupted during save");
    }

    console.log("🎉 QR code successfully saved and verified", {
      shoeId: verifyData.id,
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
