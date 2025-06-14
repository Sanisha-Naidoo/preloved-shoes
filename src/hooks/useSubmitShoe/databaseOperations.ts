
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
  logStep("Starting QR code database update", { 
    shoeId, 
    qrCodeLength: qrCodeDataURL.length,
    qrCodeType: typeof qrCodeDataURL 
  });
  
  try {
    // First, verify the shoe exists
    const { data: existingShoe, error: fetchError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .single();

    if (fetchError) {
      logStep("Error fetching shoe for QR update", { fetchError, shoeId });
      throw new Error(`Could not find shoe record ${shoeId}: ${fetchError.message}`);
    }

    if (!existingShoe) {
      logStep("Shoe not found for QR update", { shoeId });
      throw new Error(`Shoe with ID ${shoeId} not found`);
    }

    logStep("Found existing shoe for QR update", { 
      shoeId: existingShoe.id,
      hasExistingQrCode: !!existingShoe.qr_code 
    });

    // Perform the QR code update
    const { data: updatedShoe, error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code")
      .single();

    if (updateError) {
      logStep("QR code update failed", {
        updateError,
        errorCode: updateError.code,
        errorMessage: updateError.message,
        shoeId,
        qrCodeLength: qrCodeDataURL.length
      });
      throw new Error(`Failed to update QR code: ${updateError.message}`);
    }

    if (!updatedShoe) {
      logStep("QR code update returned no data", { shoeId });
      throw new Error("QR code update succeeded but returned no data");
    }

    logStep("QR code successfully saved to database", { 
      updatedShoe,
      qrCodeSaved: !!updatedShoe.qr_code,
      savedQrCodeLength: updatedShoe.qr_code?.length,
      shoeId: updatedShoe.id
    });

    // Final verification
    const { data: verifiedShoe, error: verifyError } = await supabase
      .from("shoes")
      .select("qr_code")
      .eq("id", shoeId)
      .single();
      
    if (verifyError) {
      logStep("Error during QR code verification", { verifyError, shoeId });
    } else {
      logStep("Final QR code verification", { 
        qrCodeExists: !!verifiedShoe.qr_code,
        qrCodeLength: verifiedShoe.qr_code?.length,
        qrCodeStartsCorrectly: verifiedShoe.qr_code?.startsWith('data:image/png;base64,'),
        shoeId,
        matchesGenerated: verifiedShoe.qr_code === qrCodeDataURL
      });
    }

    return true;

  } catch (error: any) {
    logStep("QR code update failed with error", { error: error.message, shoeId });
    console.error("QR code update error:", error);
    return false;
  }
};
