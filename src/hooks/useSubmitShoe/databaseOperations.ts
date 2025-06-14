
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
  console.log("🗄️ Updating shoe with QR code:");
  console.log("Input parameters:", {
    shoeId,
    shoeIdType: typeof shoeId,
    shoeIdValid: !!shoeId,
    qrCodeLength: qrCodeDataURL.length,
    qrCodeType: typeof qrCodeDataURL,
    qrCodeValid: !!qrCodeDataURL,
    isDataURL: qrCodeDataURL.startsWith('data:image'),
    timestamp: new Date().toISOString()
  });
  
  if (!shoeId) {
    console.error("❌ No shoe ID provided for database update");
    throw new Error("Shoe ID is required for QR code update");
  }
  
  if (!qrCodeDataURL) {
    console.error("❌ No QR code data provided for database update");
    throw new Error("QR code data is required for update");
  }
  
  try {
    console.log("📡 Executing Supabase update query...");
    const updateStart = Date.now();
    
    const { data, error } = await supabase
      .from("shoes")
      .update({ qr_code: qrCodeDataURL })
      .eq("id", shoeId)
      .select("id, qr_code");

    const updateDuration = Date.now() - updateStart;
    console.log(`⏱️ Update query completed in ${updateDuration}ms`);
    
    console.log("📊 Supabase update response analysis:");
    console.log("Response data:", {
      data,
      dataType: typeof data,
      dataArray: Array.isArray(data),
      dataLength: data?.length,
      hasData: !!data
    });
    console.log("Response error:", {
      error,
      errorType: typeof error,
      hasError: !!error
    });

    if (error) {
      console.error("❌ Supabase update error:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to save QR code: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.error("❌ No data returned from update");
      console.error("Possible causes:");
      console.error("1. Shoe with ID does not exist");
      console.error("2. RLS policy blocking update");
      console.error("3. Database connection issue");
      
      // Let's verify the shoe exists
      console.log("🔍 Verifying shoe exists...");
      const { data: existingShoe, error: checkError } = await supabase
        .from("shoes")
        .select("id, brand, qr_code")
        .eq("id", shoeId)
        .single();
        
      if (checkError) {
        console.error("❌ Error checking if shoe exists:", checkError);
      } else if (existingShoe) {
        console.log("✅ Shoe exists:", existingShoe);
        console.log("Current QR code value:", {
          hasQrCode: !!existingShoe.qr_code,
          qrCodeLength: existingShoe.qr_code?.length
        });
      } else {
        console.error("❌ Shoe does not exist in database");
      }
      
      throw new Error("No shoe found with the provided ID or update failed");
    }

    const updatedShoe = data[0];
    console.log("✅ Database update successful:");
    console.log("Updated shoe data:", {
      id: updatedShoe.id,
      hasQrCode: !!updatedShoe.qr_code,
      qrCodeLength: updatedShoe.qr_code?.length,
      qrCodePreview: updatedShoe.qr_code?.substring(0, 50) + "..."
    });
    
    if (updatedShoe.qr_code) {
      console.log("✅ QR code successfully saved to database");
      console.log("Verification:", {
        savedQrCodeLength: updatedShoe.qr_code.length,
        originalQrCodeLength: qrCodeDataURL.length,
        lengthsMatch: updatedShoe.qr_code.length === qrCodeDataURL.length,
        contentMatches: updatedShoe.qr_code === qrCodeDataURL
      });
    } else {
      console.error("❌ QR code field is still null after update");
      throw new Error("QR code was not saved properly - field remains null");
    }

    console.log("=== DATABASE QR UPDATE SUCCESS ===");
    return true;

  } catch (error: any) {
    console.error("=== DATABASE QR UPDATE ERROR ===");
    console.error("💥 Error updating shoe with QR code:", error);
    console.error("Full error analysis:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
