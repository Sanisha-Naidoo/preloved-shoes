
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
  console.log("=== QR CODE UPDATE DEBUG START ===");
  console.log("Shoe ID:", shoeId);
  console.log("QR Code Data URL Length:", qrCodeDataURL.length);
  console.log("QR Code starts with data:image:", qrCodeDataURL.startsWith('data:image/'));
  console.log("QR Code preview:", qrCodeDataURL.substring(0, 100));
  
  try {
    // Step 1: Verify shoe exists and get current state
    console.log("Step 1: Checking if shoe exists...");
    const { data: beforeUpdate, error: fetchError } = await supabase
      .from("shoes")
      .select("id, qr_code, brand, model")
      .eq("id", shoeId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Could not find shoe: ${fetchError.message}`);
    }

    console.log("Shoe found:", {
      id: beforeUpdate?.id,
      brand: beforeUpdate?.brand,
      model: beforeUpdate?.model,
      hasQrCode: !!beforeUpdate?.qr_code,
      qrCodeLength: beforeUpdate?.qr_code?.length || 0
    });

    // Step 2: Perform the update with detailed logging
    console.log("Step 2: Performing QR code update...");
    
    const updatePayload = { qr_code: qrCodeDataURL };
    console.log("Update payload prepared, QR code length:", updatePayload.qr_code.length);
    
    const updateResult = await supabase
      .from("shoes")
      .update(updatePayload)
      .eq("id", shoeId)
      .select("id, qr_code");

    console.log("Raw update result:", {
      data: updateResult.data,
      error: updateResult.error,
      status: updateResult.status,
      statusText: updateResult.statusText
    });

    if (updateResult.error) {
      console.error("Update failed with error:", updateResult.error);
      throw new Error(`Update failed: ${updateResult.error.message}`);
    }

    // Step 3: Verify the update with a fresh query
    console.log("Step 3: Verifying update with fresh query...");
    
    const { data: afterUpdate, error: verifyError } = await supabase
      .from("shoes")
      .select("id, qr_code, brand")
      .eq("id", shoeId)
      .single();

    if (verifyError) {
      console.error("Verification query failed:", verifyError);
      throw new Error(`Verification failed: ${verifyError.message}`);
    }

    console.log("After update verification:", {
      id: afterUpdate?.id,
      brand: afterUpdate?.brand,
      qrCodeExists: !!afterUpdate?.qr_code,
      qrCodeLength: afterUpdate?.qr_code?.length || 0,
      qrCodeMatches: afterUpdate?.qr_code === qrCodeDataURL,
      qrCodePreview: afterUpdate?.qr_code?.substring(0, 100) || "NO QR CODE"
    });

    // Step 4: Final validation
    if (!afterUpdate?.qr_code) {
      console.error("CRITICAL: QR code is null after update!");
      console.log("Attempting one more direct update...");
      
      // Try one more time with a simpler approach
      const { error: retryError } = await supabase
        .from("shoes")
        .update({ qr_code: qrCodeDataURL })
        .eq("id", shoeId);
        
      if (retryError) {
        console.error("Retry update also failed:", retryError);
      } else {
        console.log("Retry update completed, checking again...");
        const { data: finalCheck } = await supabase
          .from("shoes")
          .select("qr_code")
          .eq("id", shoeId)
          .single();
        console.log("Final check result:", {
          qrCodeExists: !!finalCheck?.qr_code,
          qrCodeLength: finalCheck?.qr_code?.length || 0
        });
      }
      
      throw new Error("QR code was not saved - still null after update");
    }

    if (afterUpdate.qr_code !== qrCodeDataURL) {
      console.error("QR code content mismatch!");
      console.log("Expected length:", qrCodeDataURL.length);
      console.log("Actual length:", afterUpdate.qr_code.length);
      throw new Error("QR code content doesn't match");
    }

    console.log("=== QR CODE UPDATE SUCCESS ===");
    return true;

  } catch (error: any) {
    console.error("=== QR CODE UPDATE FAILED ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  }
};
