
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
  
  // Add a small delay to ensure the previous transaction is fully committed
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const maxUpdateAttempts = 3;
  let updateAttempts = 0;
  let updateSuccess = false;
  
  while (updateAttempts < maxUpdateAttempts && !updateSuccess) {
    updateAttempts++;
    logStep(`QR code update attempt ${updateAttempts}/${maxUpdateAttempts}`);
    
    try {
      // First, verify the shoe still exists and get its current state
      const { data: currentShoe, error: fetchError } = await supabase
        .from("shoes")
        .select("id, qr_code, created_at")
        .eq("id", shoeId)
        .single();

      if (fetchError) {
        logStep("Error fetching shoe for QR update", { 
          fetchError, 
          shoeId, 
          attempt: updateAttempts 
        });
        
        if (updateAttempts === maxUpdateAttempts) {
          throw new Error(`Could not find shoe record ${shoeId} for QR code update: ${fetchError.message}`);
        }
        continue;
      }

      logStep("Current shoe state before QR update", { 
        currentShoe,
        hasExistingQrCode: !!currentShoe.qr_code,
        existingQrCodeLength: currentShoe.qr_code?.length || 0
      });

      // Perform the QR code update
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
          shoeId,
          attempt: updateAttempts,
          qrCodeLength: qrCodeDataURL.length
        });
        
        if (updateAttempts === maxUpdateAttempts) {
          console.error("Final QR code update attempt failed:", updateError);
          return false;
        }
        continue;
      }

      if (!updatedShoe || updatedShoe.length === 0) {
        logStep("QR code update returned no rows", { 
          updatedShoe, 
          shoeId,
          attempt: updateAttempts
        });
        
        if (updateAttempts === maxUpdateAttempts) {
          console.error("QR code update affected 0 rows after all attempts");
          return false;
        }
        continue;
      }

      // Success case
      updateSuccess = true;
      logStep("QR code successfully saved to database", { 
        updatedShoe: updatedShoe[0],
        qrCodeSaved: !!updatedShoe[0].qr_code,
        savedQrCodeLength: updatedShoe[0].qr_code?.length,
        shoeId: updatedShoe[0].id,
        attemptsRequired: updateAttempts
      });

      // Final verification - read the QR code back from the database
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

    } catch (attemptError) {
      logStep(`QR code update attempt ${updateAttempts} threw error`, {
        attemptError,
        shoeId,
        qrCodeLength: qrCodeDataURL.length
      });
      
      if (updateAttempts === maxUpdateAttempts) {
        console.error("All QR code update attempts failed:", attemptError);
        return false;
      }
    }
    
    // Add a small delay between retry attempts
    if (updateAttempts < maxUpdateAttempts && !updateSuccess) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return updateSuccess;
};
