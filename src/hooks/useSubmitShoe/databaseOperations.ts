
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
  console.log("🔥 CRITICAL QR UPDATE STARTING", { 
    shoeId, 
    qrLength: qrCodeDataURL?.length,
    qrValid: !!qrCodeDataURL?.trim(),
    timestamp: new Date().toISOString()
  });
  
  // Input validation
  if (!shoeId?.trim()) {
    const error = "Invalid shoe ID for QR update";
    console.error("❌ VALIDATION FAILED:", error);
    throw new Error(error);
  }
  
  if (!qrCodeDataURL?.trim()) {
    const error = "Invalid QR code data for update";
    console.error("❌ VALIDATION FAILED:", error);
    throw new Error(error);
  }
  
  try {
    // Step 1: Check if shoe exists first
    console.log("🔍 Step 1: Checking if shoe exists...");
    const { data: existingShoe, error: checkError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();

    if (checkError) {
      console.error("❌ SHOE CHECK FAILED:", checkError);
      throw new Error(`Failed to check shoe existence: ${checkError.message}`);
    }

    if (!existingShoe) {
      console.error("❌ SHOE NOT FOUND:", shoeId);
      throw new Error(`Shoe with ID ${shoeId} not found`);
    }

    console.log("✅ Shoe exists:", {
      id: existingShoe.id,
      hasExistingQr: !!existingShoe.qr_code,
      existingQrLength: existingShoe.qr_code?.length || 0
    });

    // Step 2: Perform the update
    console.log("🎯 Step 2: Executing QR update...");
    const { data: updateData, error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    console.log("📊 UPDATE RESULT:", { 
      updateData, 
      updateError,
      dataCount: updateData?.length || 0
    });

    if (updateError) {
      console.error("❌ SUPABASE UPDATE ERROR:", updateError);
      throw new Error(`QR update failed: ${updateError.message}`);
    }

    if (!updateData || updateData.length === 0) {
      console.error("❌ NO ROWS UPDATED");
      throw new Error("No rows updated - check shoe ID and permissions");
    }

    const updatedRow = updateData[0];
    console.log("✅ QR UPDATE SUCCESS:", {
      shoeId: updatedRow.id,
      qrSaved: !!updatedRow.qr_code,
      qrLength: updatedRow.qr_code?.length || 0,
      qrMatches: updatedRow.qr_code === qrCodeDataURL
    });

    // Step 3: Final verification with separate query
    console.log("🔍 Step 3: Final verification...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();
      
    if (verifyError) {
      console.warn("⚠️ VERIFICATION QUERY FAILED:", verifyError);
    } else {
      console.log("🔍 VERIFICATION RESULT:", {
        hasQrInDb: !!verifyData?.qr_code,
        lengthInDb: verifyData?.qr_code?.length || 0,
        matches: verifyData?.qr_code === qrCodeDataURL,
        actualValue: verifyData?.qr_code?.substring(0, 50) + "..."
      });
    }

    console.log("🎉 QR UPDATE PROCESS COMPLETED SUCCESSFULLY");
    return true;

  } catch (error: any) {
    console.error("💥 QR UPDATE FAILED:", {
      error: error.message,
      stack: error.stack,
      shoeId,
      qrLength: qrCodeDataURL?.length
    });
    throw error;
  }
};
