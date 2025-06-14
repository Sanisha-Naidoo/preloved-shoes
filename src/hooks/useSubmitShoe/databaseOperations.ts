
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
    qrSizeKB: Math.round(qrCodeDataURL?.length / 1024),
    timestamp: new Date().toISOString()
  });
  
  // Validate inputs
  if (!shoeId?.trim()) {
    throw new Error("Shoe ID is required for QR update");
  }
  
  if (!qrCodeDataURL?.trim()) {
    throw new Error("QR code data is required for update");
  }
  
  // Check if QR code is reasonable size (PostgreSQL can handle large text, but let's be safe)
  if (qrCodeDataURL.length > 100000) {
    console.warn("⚠️ QR code is very large:", qrCodeDataURL.length, "bytes");
  }
  
  try {
    // First, let's verify the shoe exists and get current state
    console.log("🔍 Checking current shoe state...");
    const { data: beforeShoe, error: beforeError } = await supabase
      .from("shoes")
      .select("id, qr_code, created_at")
      .eq("id", shoeId)
      .single();

    if (beforeError) {
      console.error("❌ Shoe lookup failed:", beforeError);
      throw new Error(`Shoe not found: ${beforeError.message}`);
    }

    console.log("✅ Shoe found:", {
      id: beforeShoe.id,
      hasQrCode: !!beforeShoe.qr_code,
      currentQrLength: beforeShoe.qr_code?.length || 0,
      createdAt: beforeShoe.created_at
    });

    // Attempt the update with detailed logging
    console.log("🎯 Attempting QR code update...");
    
    const updateResult = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    console.log("📊 Update result:", {
      error: updateResult.error,
      data: updateResult.data,
      count: updateResult.count,
      status: updateResult.status,
      statusText: updateResult.statusText
    });

    if (updateResult.error) {
      console.error("❌ QR update failed:", updateResult.error);
      throw new Error(`QR code update failed: ${updateResult.error.message}`);
    }

    if (!updateResult.data || updateResult.data.length === 0) {
      console.error("❌ No data returned from update");
      
      // Double-check the shoe still exists
      const { data: recheckShoe, error: recheckError } = await supabase
        .from("shoes")
        .select("id")
        .eq("id", shoeId)
        .single();

      if (recheckError || !recheckShoe) {
        throw new Error(`Shoe disappeared during update: ${shoeId}`);
      }
      
      throw new Error("Update succeeded but no data returned");
    }

    const updatedShoe = updateResult.data[0];
    
    console.log("📋 Update verification:", {
      shoeId: updatedShoe.id,
      hasQrCode: !!updatedShoe.qr_code,
      qrCodeLength: updatedShoe.qr_code?.length || 0,
      expectedLength: qrCodeDataURL.length,
      dataMatches: updatedShoe.qr_code === qrCodeDataURL
    });

    // Verify the QR code was actually saved
    if (!updatedShoe.qr_code) {
      console.error("❌ QR code field is empty after update");
      
      // Try a direct raw update as a fallback
      console.log("🔄 Attempting fallback update...");
      const fallbackResult = await supabase
        .from("shoes")
        .update({ qr_code: qrCodeDataURL })
        .eq("id", shoeId);
        
      if (fallbackResult.error) {
        throw new Error(`Fallback update also failed: ${fallbackResult.error.message}`);
      }
      
      // Check again
      const { data: finalCheck } = await supabase
        .from("shoes")
        .select("qr_code")
        .eq("id", shoeId)
        .single();
        
      if (!finalCheck?.qr_code) {
        throw new Error("QR code could not be saved to database - possible database constraint issue");
      }
    }

    if (updatedShoe.qr_code.length !== qrCodeDataURL.length) {
      console.warn("⚠️ QR code length mismatch:", {
        expected: qrCodeDataURL.length,
        actual: updatedShoe.qr_code.length
      });
    }

    console.log("🎉 QR code successfully saved and verified");
    return true;

  } catch (error: any) {
    console.error("💥 QR UPDATE PROCESS FAILED:", {
      error: error.message,
      stack: error.stack,
      shoeId,
      qrLength: qrCodeDataURL?.length
    });
    throw error;
  }
};
