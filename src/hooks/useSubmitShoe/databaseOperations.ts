
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
    qrCodeType: typeof qrCodeDataURL,
    qrCodePreview: qrCodeDataURL.substring(0, 50) + "..."
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

    // Perform the QR code update with better error handling
    const { data: updatedShoe, error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    if (updateError) {
      logStep("QR code update failed", {
        updateError,
        errorCode: updateError.code,
        errorMessage: updateError.message,
        errorDetails: updateError.details,
        errorHint: updateError.hint,
        shoeId,
        qrCodeLength: qrCodeDataURL.length
      });
      throw new Error(`Failed to update QR code: ${updateError.message}`);
    }

    if (!updatedShoe || updatedShoe.length === 0) {
      logStep("QR code update returned no data", { shoeId });
      throw new Error("QR code update succeeded but returned no data");
    }

    const updated = updatedShoe[0];
    logStep("QR code successfully saved to database", { 
      updatedShoe: updated,
      qrCodeSaved: !!updated.qr_code,
      savedQrCodeLength: updated.qr_code?.length,
      shoeId: updated.id,
      updateSuccessful: updated.qr_code === qrCodeDataURL
    });

    // Double-check with a fresh query
    const { data: verifiedShoe, error: verifyError } = await supabase
      .from("shoes")
      .select("qr_code")
      .eq("id", shoeId)
      .single();
      
    if (verifyError) {
      logStep("Error during QR code verification", { verifyError, shoeId });
      console.warn("QR code verification failed:", verifyError);
    } else {
      logStep("Final QR code verification", { 
        qrCodeExists: !!verifiedShoe.qr_code,
        qrCodeLength: verifiedShoe.qr_code?.length,
        qrCodeStartsCorrectly: verifiedShoe.qr_code?.startsWith('data:image/png;base64,'),
        shoeId,
        matchesGenerated: verifiedShoe.qr_code === qrCodeDataURL,
        verifiedData: verifiedShoe.qr_code?.substring(0, 100) + "..."
      });
      
      if (!verifiedShoe.qr_code) {
        throw new Error("QR code was not properly saved - verification failed");
      }
    }

    return true;

  } catch (error: any) {
    logStep("QR code update failed with error", { 
      error: error.message, 
      errorStack: error.stack,
      shoeId,
      qrCodeLength: qrCodeDataURL.length 
    });
    console.error("QR code update error:", error);
    throw error; // Re-throw to handle in calling function
  }
};
