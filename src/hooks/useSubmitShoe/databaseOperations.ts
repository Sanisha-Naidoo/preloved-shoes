
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
  logStep("Creating shoe record with QR code generation");
  
  try {
    // First, create the shoe record without QR code
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

    // Generate QR code
    let qrCodeDataURL: string | null = null;
    try {
      console.log("🔍 Generating QR code for shoe:", shoeId);
      const qrData = generateShoeQRData(shoeId);
      console.log("📝 QR data generated:", qrData);
      
      qrCodeDataURL = await generateQRCode(qrData);
      console.log("✅ QR code generated, length:", qrCodeDataURL?.length);
      
      if (!qrCodeDataURL) {
        throw new Error("QR code generation returned null");
      }
      
      // Validate QR code format before saving
      if (!qrCodeDataURL.startsWith('data:image/png;base64,')) {
        throw new Error("Invalid QR code format - not a valid data URL");
      }
      
      // Save QR code to database with explicit validation
      console.log("💾 Updating shoe with QR code...");
      const updateResult = await updateShoeWithQRCode(shoeId, qrCodeDataURL);
      
      if (!updateResult) {
        throw new Error("Failed to save QR code to database");
      }
      
      console.log("🎉 QR code successfully saved to database");
      logStep("QR code generated and saved successfully");
      
    } catch (qrError: any) {
      console.error("❌ QR code generation failed:", qrError);
      logStep("QR code generation failed but shoe creation succeeded", qrError);
      // Don't throw here - the shoe is created, just QR failed
      qrCodeDataURL = null;
    }

    return { shoeId, qrCodeDataURL };

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
  
  // Validate QR code format
  if (!qrCodeDataURL.startsWith('data:image/png;base64,')) {
    throw new Error("Invalid QR code format for database storage");
  }
  
  try {
    console.log("📝 Updating QR code in database...");
    
    const { data, error } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    if (error) {
      console.error("❌ QR update failed:", error);
      throw new Error(`Failed to update QR code: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.error("❌ No shoe record found with ID:", shoeId);
      throw new Error(`Shoe record not found: ${shoeId}`);
    }

    const updatedShoe = data[0];
    const hasQrCode = !!updatedShoe.qr_code;
    
    console.log("✅ QR code update result:", {
      shoeId: updatedShoe.id,
      hasQrCode,
      qrCodeLength: updatedShoe.qr_code?.length || 0
    });

    if (!hasQrCode) {
      throw new Error("QR code was not saved to database");
    }

    // Double-check by reading back the record
    const { data: verifyData, error: verifyError } = await supabase
      .from("shoes")
      .select("qr_code")
      .eq("id", shoeId)
      .single();

    if (verifyError) {
      console.warn("⚠️ Could not verify QR code save:", verifyError);
    } else if (!verifyData?.qr_code) {
      throw new Error("QR code verification failed - data not persisted");
    } else {
      console.log("✅ QR code verified in database:", {
        length: verifyData.qr_code.length,
        startsCorrectly: verifyData.qr_code.startsWith('data:image/')
      });
    }

    console.log("🎉 QR code successfully saved to database");
    return true;

  } catch (error: any) {
    console.error("💥 QR code update failed:", error);
    throw error;
  }
};
