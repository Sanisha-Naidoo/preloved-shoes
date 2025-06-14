
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
    timestamp: new Date().toISOString()
  });
  
  if (!shoeId?.trim()) {
    throw new Error("Invalid shoe ID for QR update");
  }
  
  if (!qrCodeDataURL?.trim()) {
    throw new Error("Invalid QR code data for update");
  }
  
  try {
    // Direct update with simplified query
    console.log("🎯 Executing direct QR update...");
    const { data, error } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    console.log("📊 UPDATE RESULT:", { 
      data, 
      error,
      dataCount: data?.length || 0
    });

    if (error) {
      console.error("❌ Supabase update error:", error);
      throw new Error(`QR update failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.error("❌ No rows updated - shoe may not exist or RLS blocking");
      throw new Error("No rows updated - check shoe ID and permissions");
    }

    const updatedRow = data[0];
    console.log("✅ QR UPDATE SUCCESS:", {
      shoeId: updatedRow.id,
      qrSaved: !!updatedRow.qr_code,
      qrLength: updatedRow.qr_code?.length || 0
    });

    // Immediate verification
    const { data: verifyData } = await supabase
      .from("shoes")
      .select("qr_code")
      .eq("id", shoeId)
      .single();
      
    console.log("🔍 VERIFICATION CHECK:", {
      hasQrInDb: !!verifyData?.qr_code,
      lengthInDb: verifyData?.qr_code?.length || 0,
      matches: verifyData?.qr_code === qrCodeDataURL
    });

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
