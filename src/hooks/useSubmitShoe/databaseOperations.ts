
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
    timestamp: new Date().toISOString()
  });
  
  if (!shoeId?.trim() || !qrCodeDataURL?.trim()) {
    throw new Error("Invalid parameters for QR update");
  }
  
  try {
    // First verify the shoe exists
    console.log("🔍 Verifying shoe exists...");
    const { data: existingShoe, error: checkError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();

    if (checkError) {
      console.error("❌ Shoe verification failed:", checkError);
      throw new Error(`Failed to verify shoe: ${checkError.message}`);
    }

    console.log("✅ Shoe verified:", {
      id: existingShoe.id,
      hasQr: !!existingShoe.qr_code
    });

    // Perform the update with explicit column reference
    console.log("🎯 Executing QR update...");
    const { data: updateResult, error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    if (updateError) {
      console.error("❌ Update failed:", updateError);
      throw new Error(`Update failed: ${updateError.message}`);
    }

    console.log("📊 Update result:", {
      success: !!updateResult,
      rowsUpdated: updateResult?.length || 0,
      updatedId: updateResult?.[0]?.id,
      hasQrCode: !!updateResult?.[0]?.qr_code
    });

    if (!updateResult || updateResult.length === 0) {
      // Try alternative update approach
      console.log("🔄 Attempting alternative update...");
      const { error: altError } = await supabase
        .from("shoes")
        .update({ qr_code: qrCodeDataURL })
        .match({ id: shoeId });

      if (altError) {
        console.error("❌ Alternative update failed:", altError);
        throw new Error(`Both update attempts failed: ${altError.message}`);
      }

      // Verify the alternative update worked
      const { data: verifyData } = await supabase
        .from("shoes")
        .select("qr_code")
        .eq("id", shoeId)
        .single();

      if (verifyData?.qr_code === qrCodeDataURL) {
        console.log("✅ Alternative update successful");
        return true;
      } else {
        throw new Error("Update verification failed");
      }
    }

    console.log("🎉 QR code update completed successfully");
    return true;

  } catch (error: any) {
    console.error("💥 QR UPDATE FAILED:", {
      error: error.message,
      shoeId,
      qrLength: qrCodeDataURL?.length
    });
    throw error;
  }
};
