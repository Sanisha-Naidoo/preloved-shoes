
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
  console.log("=== STARTING QR CODE DATABASE UPDATE ===");
  console.log("🔍 Input validation:", {
    shoeId,
    shoeIdValid: !!shoeId && shoeId.length > 0,
    qrCodeLength: qrCodeDataURL?.length || 0,
    qrCodeValid: !!qrCodeDataURL && qrCodeDataURL.length > 0,
    timestamp: new Date().toISOString()
  });
  
  if (!shoeId || shoeId.trim() === '') {
    const error = "❌ No valid shoe ID provided for QR code update";
    console.error(error);
    throw new Error("Shoe ID is required for QR code update");
  }
  
  if (!qrCodeDataURL || qrCodeDataURL.trim() === '') {
    const error = "❌ No valid QR code data provided for update";
    console.error(error);
    throw new Error("QR code data is required for update");
  }
  
  try {
    // First verify the shoe exists
    console.log("🔍 Step 1: Verifying shoe exists in database...");
    const { data: existingShoe, error: findError } = await supabase
      .from("shoes")
      .select("id, brand, model, qr_code")
      .eq("id", shoeId)
      .single();
      
    if (findError) {
      console.error("❌ Error finding shoe:", findError);
      throw new Error(`Failed to find shoe: ${findError.message}`);
    }
    
    if (!existingShoe) {
      console.error("❌ Shoe not found with ID:", shoeId);
      throw new Error(`No shoe found with ID: ${shoeId}`);
    }
    
    console.log("✅ Shoe found:", {
      id: existingShoe.id,
      brand: existingShoe.brand,
      model: existingShoe.model,
      hasExistingQrCode: !!existingShoe.qr_code,
      existingQrCodeLength: existingShoe.qr_code?.length || 0
    });
    
    // Now update with QR code
    console.log("💾 Step 2: Updating shoe with QR code...");
    const updateStart = Date.now();
    
    const { data: updateData, error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    const updateDuration = Date.now() - updateStart;
    console.log(`⏱️ Update operation completed in ${updateDuration}ms`);
    
    console.log("📊 Update response analysis:");
    console.log("Update data:", {
      data: updateData,
      isArray: Array.isArray(updateData),
      length: updateData?.length || 0,
      hasData: !!updateData
    });
    console.log("Update error:", {
      error: updateError,
      hasError: !!updateError
    });

    if (updateError) {
      console.error("❌ Supabase update error:", updateError);
      throw new Error(`Failed to update QR code: ${updateError.message}`);
    }

    if (!updateData || updateData.length === 0) {
      console.error("❌ No data returned from update operation");
      console.error("This could indicate:");
      console.error("1. RLS policy blocking the update");
      console.error("2. Shoe ID doesn't exist");
      console.error("3. Database connection issue");
      throw new Error("Update operation returned no data - check RLS policies");
    }

    const updatedShoe = updateData[0];
    console.log("✅ Update successful! Updated shoe:");
    console.log("Updated data:", {
      id: updatedShoe.id,
      qrCodeSaved: !!updatedShoe.qr_code,
      qrCodeLength: updatedShoe.qr_code?.length || 0,
      qrCodeMatches: updatedShoe.qr_code === qrCodeDataURL
    });
    
    // Final verification - re-fetch to confirm save
    console.log("🔍 Step 3: Final verification - re-fetching from database...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();
      
    if (verifyError) {
      console.error("❌ Verification fetch error:", verifyError);
    } else {
      console.log("🎯 Final verification result:", {
        id: verifyData.id,
        hasQrCode: !!verifyData.qr_code,
        qrCodeLength: verifyData.qr_code?.length || 0,
        qrCodeMatches: verifyData.qr_code === qrCodeDataURL,
        successful: !!verifyData.qr_code && verifyData.qr_code === qrCodeDataURL
      });
    }

    console.log("=== QR CODE DATABASE UPDATE COMPLETED SUCCESSFULLY ===");
    return true;

  } catch (error: any) {
    console.error("=== QR CODE DATABASE UPDATE FAILED ===");
    console.error("💥 Complete error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
