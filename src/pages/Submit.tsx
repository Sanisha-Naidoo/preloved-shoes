
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";

const Submit = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to submit data when the component mounts
    submitData();
  }, []);

  const submitData = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Check if Supabase is configured before proceeding
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured. Please connect your Lovable Project to Supabase.");
      }

      // Get all the data from session storage
      const shoeDetailsStr = sessionStorage.getItem("shoeDetails");
      const solePhotoStr = sessionStorage.getItem("solePhoto");
      const ratingStr = sessionStorage.getItem("rating");

      if (!shoeDetailsStr || !solePhotoStr) {
        throw new Error("Missing required data");
      }

      const shoeDetails = JSON.parse(shoeDetailsStr);
      const solePhoto = solePhotoStr;
      const rating = ratingStr ? parseInt(ratingStr) : null;

      // 1. Upload the image to Supabase Storage
      const file = await dataURLtoFile(solePhoto, "sole_photo.jpg");
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("sole_photos")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase
        .storage
        .from("sole_photos")
        .getPublicUrl(fileName);

      const photoUrl = publicUrlData.publicUrl;

      // 2. Save the shoe data to the shoes table
      const { data: shoeData, error: shoeError } = await supabase
        .from("shoes")
        .insert([
          {
            brand: shoeDetails.brand,
            model: shoeDetails.model || null,
            size: shoeDetails.size,
            condition: shoeDetails.condition,
            barcode: shoeDetails.barcode || null,
          },
        ])
        .select();

      if (shoeError) {
        throw shoeError;
      }

      const shoeId = shoeData[0].id;

      // 3. Save the scan data to the scans table
      const { error: scanError } = await supabase
        .from("scans")
        .insert([
          {
            shoe_id: shoeId,
            sole_photo_url: photoUrl,
            rating: rating,
            created_at: new Date().toISOString(),
          },
        ]);

      if (scanError) {
        throw scanError;
      }

      // Clear session storage after successful submission
      sessionStorage.removeItem("shoeDetails");
      sessionStorage.removeItem("solePhoto");
      sessionStorage.removeItem("rating");

      setIsSubmitted(true);
      toast.success("Submission successful!");
    } catch (error: any) {
      console.error("Error submitting data:", error);
      const errorMessage = error.message || "Failed to submit data. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert data URL to File object
  const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File> => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleAnotherSubmission = () => {
    navigate("/");
  };

  const handleFinish = () => {
    // Just close or navigate to a final page
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {isSubmitting ? (
              <div>
                <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold mb-4">Submitting...</h2>
                <p className="text-gray-600">
                  Please wait while we process your submission.
                </p>
              </div>
            ) : error ? (
              <div>
                <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="h-12 w-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Submission Error</h2>
                <p className="text-gray-600 mb-8">{error}</p>
                <Button onClick={() => navigate("/")} className="w-full">
                  Return Home
                </Button>
              </div>
            ) : (
              <>
                <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="h-12 w-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>

                <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
                <p className="text-gray-600 mb-8">
                  Your submission has been received successfully.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleAnotherSubmission}>
                    Submit Another Shoe
                  </Button>
                  <Button onClick={handleFinish}>
                    Finish
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Submit;
