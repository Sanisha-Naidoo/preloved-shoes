
import { useState, useRef } from "react";
import { toast } from "sonner";
import { validateImage } from "@/utils/imageUtils";
import { processAndUploadImage } from "@/hooks/useSubmitShoe/imageProcessing";
import { createShoeRecord } from "@/hooks/useSubmitShoe/databaseOperations";
import { clearSessionData } from "@/hooks/useSubmitShoe/sessionCleanup";

async function syncToNotion(shoe: any) {
  try {
    const res = await fetch(
      "https://aycjzixhdarwgzdwoxun.functions.supabase.co/notion-sync",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shoe),
      }
    );
    if (!res.ok) {
      const errorRes = await res.json();
      console.error("Failed to sync with Notion", errorRes);
    } else {
      console.log("Shoe entry synced to Notion");
    }
  } catch (e) {
    console.error("Sync to Notion failed", e);
  }
}

export const useSimpleSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submissionInProgress = useRef(false);

  const submitData = async () => {
    if (isSubmitting || isSubmitted || submissionInProgress.current) {
      console.log("Submission already in progress or completed, skipping");
      return;
    }

    try {
      submissionInProgress.current = true;
      setIsSubmitting(true);
      setError(null);

      console.log("🚀 Starting submission process");

      // Get data from sessionStorage - assume it's valid since user reached this step
      const shoeDetailsStr = sessionStorage.getItem("shoeDetails");
      const solePhotoStr = sessionStorage.getItem("solePhoto");
      const rating = sessionStorage.getItem("rating") ? parseInt(sessionStorage.getItem("rating")!) : null;
      
      if (!shoeDetailsStr) {
        throw new Error("Session data lost. Please start over.");
      }

      const shoeDetails = JSON.parse(shoeDetailsStr);
      
      // Only validate image if photo is provided
      if (solePhotoStr) {
        validateImage(solePhotoStr);
      }

      console.log("✅ Data retrieval successful");

      console.log("📸 Processing and uploading image...");
      const photoUrl = await processAndUploadImage(solePhotoStr);
      console.log("✅ Image upload successful:", photoUrl);

      console.log("💾 Creating shoe record...");

      const { shoeId } = await createShoeRecord({
        brand: shoeDetails.brand,
        model: shoeDetails.model,
        size: shoeDetails.size,
        sizeUnit: shoeDetails.sizeUnit,
        condition: shoeDetails.condition,
        rating,
        photoUrl
      });

      // SYNC TO NOTION
      syncToNotion({
        brand: shoeDetails.brand,
        model: shoeDetails.model,
        size: shoeDetails.size,
        sizeUnit: shoeDetails.sizeUnit,
        condition: shoeDetails.condition,
        rating,
        photoUrl
      });

      console.log("✅ Shoe record created with ID:", shoeId);

      setSubmissionId(shoeId);
      setIsSubmitted(true);
      clearSessionData();
      toast.success("Submission successful!");

      console.log("🎉 Submission process completed successfully");

    } catch (error: any) {
      console.error("💥 Submission process failed:", error);
      setError(error.message || "Technical error occurred. Please try again.");
      toast.error(error.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
      submissionInProgress.current = false;
    }
  };

  return {
    isSubmitting,
    isSubmitted,
    submissionId,
    error,
    submitData,
    setIsSubmitted: (value: boolean) => {
      setIsSubmitted(value);
      if (!value) {
        submissionInProgress.current = false;
        setSubmissionId(null);
        setError(null);
      }
    }
  };
};
