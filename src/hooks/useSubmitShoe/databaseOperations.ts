
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
  console.log("=== DATABASE QR UPDATE START ===");
  console.log("Updating shoe with QR code:");
  console.log("- Shoe ID:", shoeId);
  console.log("- QR code length:", qrCodeDataURL.length);
  console.log("- QR code preview:", qrCodeDataURL.substring(0, 50) + "...");
  
  try {
    const { data, error } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    console.log("Supabase update response:");
    console.log("- Data:", data);
    console.log("- Error:", error);

    if (error) {
      console.error("❌ Supabase error:", error);
      throw new Error(`Failed to save QR code: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.error("❌ No data returned from update - shoe might not exist");
      throw new Error("No shoe found with the provided ID");
    }

    const updatedShoe = data[0];
    console.log("✅ Updated shoe data:", updatedShoe);
    
    if (updatedShoe.qr_code) {
      console.log("✅ QR code successfully saved to database");
      console.log("- Saved QR code length:", updatedShoe.qr_code.length);
    } else {
      console.error("❌ QR code is still null after update");
      throw new Error("QR code was not saved properly");
    }

    console.log("=== DATABASE QR UPDATE SUCCESS ===");
    return true;

  } catch (error: any) {
    console.error("=== DATABASE QR UPDATE ERROR ===");
    console.error("Error updating shoe with QR code:", error);
    throw error;
  }
};
