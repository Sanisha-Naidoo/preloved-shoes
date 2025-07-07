
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useStepperProgress } from "@/hooks/useStepperProgress";
import { Stepper } from "@/components/ui/stepper";

const Rating = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number | null>(null);
  const { steps, currentStep } = useStepperProgress();

  const handleSkip = () => {
    handleSubmit();
  };

  const handleSubmit = () => {
    // Store the rating in session storage
    if (rating !== null) {
      sessionStorage.setItem("rating", rating.toString());
    }
    // Navigate directly to submit instead of barcode scan
    navigate("/submit");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col relative overflow-hidden p-4">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.3)_1px,_transparent_0)] bg-[length:32px_32px]"></div>
      {/* Ambient Background Shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-200/15 to-teal-200/15 rounded-full blur-3xl opacity-40"></div>
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-md mx-auto relative z-10">
        {/* Progress Stepper */}
        <div className="mb-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <h1 className="text-2xl font-bold mb-2">Rate Your Experience</h1>
        <p className="text-gray-600 mb-6">
          On a scale of 1-10, how would you rate your experience with this shoe?
        </p>

        <Card className="mb-6 bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl shadow-gray-500/10 rounded-3xl transition-all duration-500 ease-out hover:shadow-3xl hover:shadow-gray-500/15 hover:bg-white/80">
          <CardContent className="p-4">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                <Button 
                  key={num} 
                  variant={rating === num ? "default" : "outline"} 
                  onClick={() => setRating(num)} 
                  className="w-full aspect-square flex items-center justify-center p-0"
                >
                  {num}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/30 border-0 rounded-2xl button-premium">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rating;
