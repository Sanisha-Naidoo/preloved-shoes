
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const Submit = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    // Attempt to submit data when the component mounts
    submitData();
  }, []);

  // Enhanced dataURLtoFile function with optimization
  const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File> => {
    try {
      // Split the data URL to get the MIME type and base64 data
      const arr = dataUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      
      // Convert base64 to binary
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      // Optimize file size if it's an image (compress if needed)
      if (mime.startsWith('image/')) {
        // We've already resized in photoCapture.ts, but we're creating a proper File object here
        console.log(`Creating optimized file (${mime}) with size: ${u8arr.length} bytes`);
      }
      
      // Create and return a File object
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error converting data URL to file:", error);
      throw new Error("Failed to process image. Please try again.");
    }
  };

  // Function to upload file with retry mechanism
  const uploadFileWithRetry = async (file: File, fileName: string, retryAttempt = 0): Promise<string> => {
    try {
      console.log(`Uploading file (attempt ${retryAttempt + 1}/${MAX_RETRIES + 1})...`);
      
      // Attempt the upload
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("sole_photos")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        
        // Check if we should retry
        if (retryAttempt < MAX_RETRIES) {
          console.log(`Retrying upload (attempt ${retryAttempt + 2}/${MAX_RETRIES + 1})...`);
          // Wait exponentially longer between retries (1s, 2s, 4s)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryAttempt) * 1000));
          return uploadFileWithRetry(file, fileName, retryAttempt + 1);
        }
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase
        .storage
        .from("sole_photos")
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Final upload error:", error);
      throw error;
    }
  };

  const validateRequiredData = () => {
    const shoeDetailsStr = sessionStorage.getItem("shoeDetails");
    const solePhotoStr = sessionStorage.getItem("solePhoto");
    
    if (!shoeDetailsStr) {
      throw new Error("Missing shoe details. Please complete the shoe information form.");
    }
    
    if (!solePhotoStr) {
      throw new Error("Missing shoe photo. Please capture a photo of your shoe sole.");
    }
    
    try {
      // Verify JSON is valid
      const shoeDetails = JSON.parse(shoeDetailsStr);
      return { shoeDetails, solePhoto: solePhotoStr };
    } catch (e) {
      throw new Error("Invalid shoe data format. Please try again.");
    }
  };

  const submitData = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate required data
      const { shoeDetails, solePhoto } = validateRequiredData();
      const rating = sessionStorage.getItem("rating") ? parseInt(sessionStorage.getItem("rating")!) : null;
      
      // 1. Prepare the image file
      console.log("Preparing image for upload...");
      const file = await dataURLtoFile(solePhoto, "sole_photo.jpg");
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
      
      // 2. Upload the image with retry mechanism
      console.log("Starting file upload with retry mechanism...");
      const photoUrl = await uploadFileWithRetry(file, fileName);
      console.log("File upload successful:", photoUrl);
      
      // 3. Save the shoe data to the shoes table
      console.log("Saving shoe data to database...");
      const { data: shoeData, error: shoeError } = await supabase
        .from("shoes")
        .insert([
          {
            brand: shoeDetails.brand,
            model: shoeDetails.model || null,
            size: shoeDetails.size,
            size_unit: shoeDetails.sizeUnit,
            condition: shoeDetails.condition,
            barcode: shoeDetails.barcode || null,
          },
        ])
        .select();

      if (shoeError) {
        throw shoeError;
      }

      const shoeId = shoeData[0].id;
      
      // 4. Save the scan data to the scans table
      const { error: scanError } = await supabase
        .from("scans")
        .insert([
          {
            shoe_id: shoeId,
            sole_photo_url: photoUrl,
            rating: rating,
          },
        ]);

      if (scanError) {
        throw scanError;
      }

      // Clear session storage after successful submission
      console.log("Submission successful! Clearing session storage...");
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
      
      // If errors are related to missing data rather than network issues, 
      // don't retry automatically but guide the user
      if (errorMessage.includes("Missing") || errorMessage.includes("Invalid")) {
        // User guidance error - don't retry
      } else if (retryCount < MAX_RETRIES) {
        // Network or server error - retry with exponential backoff
        setRetryCount(count => count + 1);
        const timeout = Math.pow(2, retryCount) * 1000;
        toast.info(`Retrying in ${timeout/1000} seconds...`);
        setTimeout(() => {
          submitData();
        }, timeout);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnotherSubmission = () => {
    navigate("/");
  };

  const handleFinish = () => {
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
                  {retryCount > 0 && ` (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`}
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
