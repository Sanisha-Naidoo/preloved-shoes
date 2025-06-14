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
  if (!qrCodeDataURL.startsWith('data:image/')) {
    throw new Error("Invalid QR code format for database storage");
  }

  // Wait briefly to handle potential database latency for just-created shoes
  await new Promise(res => setTimeout(res, 800)); // 800ms buffer (experimental; adjust as needed)

  let existingShoe = null;
  let attempts = 0;
  const maxAttempts = 5;

  // Retry loop for "does the shoe exist?"
  while (!existingShoe && attempts < maxAttempts) {
    attempts++;
    console.log(`📋 Verification attempt ${attempts}/${maxAttempts}`);
    const { data: checkData, error: checkError } = await supabase
      .from("shoes")
      .select("id, created_at")
      .eq("id", shoeId)
      .maybeSingle();
    if (checkError) {
      console.error("❌ Shoe record verification failed:", checkError);
      if (attempts === maxAttempts) {
        throw new Error(`Shoe record verification failed: ${checkError.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 600));
      continue;
    }
    if (checkData) {
      existingShoe = checkData;
      break;
    }
    if (attempts < maxAttempts) {
      console.log("⏳ DB not ready. Retrying...");
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  if (!existingShoe) {
    throw new Error("Shoe record not found after verification attempts");
  }
  console.log("✅ Shoe record verified:", { id: existingShoe.id, created_at: existingShoe.created_at });

  // Update and verify the QR code in a retry loop
  let updateAttempts = 0;
  let lastUpdateError: any = null;
  const maxUpdateAttempts = 4;

  while (updateAttempts < maxUpdateAttempts) {
    updateAttempts++;
    console.log(`💾 Updating (attempt ${updateAttempts}/${maxUpdateAttempts}) QR code in database...`);
    const { error: updateError } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId);

    if (updateError) {
      lastUpdateError = updateError;
      console.error("❌ QR update failed:", updateError);
      await new Promise(res => setTimeout(res, 800)); // Wait and retry
      continue;
    }

    // Check if actually updated
    const { data: verifyData, error: verifyError } = await supabase
      .from("shoes")
      .select("id, qr_code")
      .eq("id", shoeId)
      .maybeSingle();

    if (verifyError) {
      lastUpdateError = verifyError;
      console.error("❌ QR update verification failed:", verifyError);
      await new Promise(res => setTimeout(res, 800));
      continue;
    }

    const hasQrCode = !!verifyData?.qr_code;
    if (hasQrCode) {
      console.log("🎉 QR code successfully saved and verified", { id: shoeId, qrCodeLength: verifyData.qr_code.length });
      logStep("QR code saved to database successfully", { shoeId, qrCodeLength: verifyData.qr_code.length });
      return true;
    } else {
      lastUpdateError = new Error("QR code field still empty after update");
      console.warn("QR code field still empty after update. Retrying...");
      await new Promise(res => setTimeout(res, 900));
    }
  }

  console.error("💥 QR code update failed after all attempts:", lastUpdateError);
  logStep("QR code database update failed", { shoeId, error: lastUpdateError?.message });
  throw new Error("QR code was not saved to database after multiple attempts");
};
