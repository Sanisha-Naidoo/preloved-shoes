
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

export const createShoeRecord = async (data: ShoeData): Promise<{ shoeId: string }> => {
  logStep("Creating shoe record");
  
  try {
    // Create the shoe record
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
      .select()
      .single();

    if (shoeError) {
      logStep("Error saving shoe data", shoeError);
      throw shoeError;
    }

    if (!shoeData) {
      logStep("No shoe data returned after insert");
      throw new Error("Failed to create shoe record");
    }

    const shoeId = shoeData.id;
    logStep("Shoe data saved successfully", { shoeId });

    return { shoeId };

  } catch (error: any) {
    logStep("Failed to create shoe record", error);
    throw error;
  }
};

export const updateShoeWithQRCode = async (shoeId: string, qrCodeDataURL: string): Promise<boolean> => {
  console.log("🔥 Starting QR code update", { shoeId, qrCodeSize: qrCodeDataURL?.length });
  
  if (!shoeId?.trim()) {
    throw new Error("Shoe ID is required for QR update");
  }
  
  if (!qrCodeDataURL?.trim()) {
    throw new Error("QR code data is required for update");
  }
  
  // Basic validation - check it's a data URL
  if (!qrCodeDataURL.startsWith('data:image/')) {
    throw new Error("Invalid QR code format for database storage");
  }
  
  try {
    console.log("🔍 Verifying shoe record exists...");
    
    // First verify the shoe exists with retry logic
    let existingShoe = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!existingShoe && attempts < maxAttempts) {
      attempts++;
      console.log(`📋 Verification attempt ${attempts}/${maxAttempts}`);
      
      const { data: checkData, error: checkError } = await supabase
        .from("shoes")
        .select("id, created_at")
        .eq("id", shoeId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no record found
      
      if (checkError) {
        console.error("❌ Shoe record verification failed:", checkError);
        if (attempts === maxAttempts) {
          throw new Error(`Shoe record verification failed: ${checkError.message}`);
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      if (checkData) {
        existingShoe = checkData;
        console.log("✅ Shoe record verified:", { id: existingShoe.id, created_at: existingShoe.created_at });
        break;
      }
      
      if (attempts < maxAttempts) {
        console.log(`⏳ Shoe record not found yet, waiting 500ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!existingShoe) {
      console.error("❌ No shoe record found with ID after retries:", shoeId);
      throw new Error("Shoe record not found after verification attempts");
    }
    
    console.log("💾 Updating QR code in database...");
    
    // Update the QR code
    const { error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId);

    if (updateError) {
      console.error("❌ QR update failed:", updateError);
      throw new Error(`Failed to update QR code: ${updateError.message}`);
    }

    // Verify the update was successful
    console.log("🔍 Verifying QR code was saved...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();

    if (verifyError || !verifyData) {
      console.error("❌ QR update verification failed:", verifyError);
      throw new Error("Failed to verify QR code update");
    }

    const hasQrCode = !!verifyData.qr_code;
    const qrCodeLength = verifyData.qr_code?.length || 0;
    
    console.log("✅ QR code update result:", {
      shoeId: verifyData.id,
      hasQrCode,
      qrCodeLength
    });

    if (!hasQrCode) {
      throw new Error("QR code was not saved to database");
    }

    console.log("🎉 QR code successfully saved to database");
    logStep("QR code saved to database successfully", { shoeId, qrCodeLength });
    return true;

  } catch (error: any) {
    console.error("💥 QR code update failed:", error);
    logStep("QR code database update failed", { shoeId, error: error.message });
    throw error;
  }
};
