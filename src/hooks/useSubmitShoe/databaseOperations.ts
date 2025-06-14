
import { supabase } from "@/integrations/supabase/client";
import { logStep } from "./submissionLogger";
import { generateQRCode, generateShoeQRData } from "@/utils/qrCodeUtils";

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

export const createShoeRecord = async (data: ShoeData): Promise<{ shoeId: string; qrCodeDataURL: string | null }> => {
  logStep("Creating shoe record");
  
  try {
    // Create the shoe record without QR code initially
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

    // Return without QR code - it will be generated later when user clicks action buttons
    return { shoeId, qrCodeDataURL: null };

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
  
  // Basic validation - just check it's a data URL
  if (!qrCodeDataURL.startsWith('data:image/')) {
    throw new Error("Invalid QR code format for database storage");
  }
  
  try {
    console.log("📝 Updating QR code in database...");
    
    // First verify the shoe exists
    const { data: existingShoe, error: checkError } = await supabase
      .from("shoes")
      .select("id")
      .eq("id", shoeId)
      .single();
    
    if (checkError) {
      console.error("❌ Shoe record verification failed:", checkError);
      throw new Error(`Shoe record not found: ${checkError.message}`);
    }
    
    if (!existingShoe) {
      console.error("❌ No shoe record found with ID:", shoeId);
      throw new Error("Shoe record not found");
    }
    
    console.log("✅ Shoe record verified, proceeding with QR update");
    
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
    
    console.log("✅ QR code update result:", {
      shoeId: verifyData.id,
      hasQrCode,
      qrCodeLength: verifyData.qr_code?.length || 0
    });

    if (!hasQrCode) {
      throw new Error("QR code was not saved to database");
    }

    console.log("🎉 QR code successfully saved to database");
    return true;

  } catch (error: any) {
    console.error("💥 QR code update failed:", error);
    throw error;
  }
};
