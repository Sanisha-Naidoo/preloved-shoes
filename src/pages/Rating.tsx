
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const Rating = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number | null>(null);

  const handleSkip = () => {
    handleSubmit();
  };

  const handleSubmit = () => {
    // Store the rating in session storage
    if (rating !== null) {
      sessionStorage.setItem("rating", rating.toString());
    }
    navigate("/submit");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Rate Your Experience</h1>
        <p className="text-gray-600 mb-6">
          On a scale of 1-10, how would you rate your experience with this shoe?
        </p>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-nowrap justify-between gap-2 w-full">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <Button
                  key={num}
                  variant={rating === num ? "default" : "outline"}
                  className={`h-12 w-12 min-w-[3rem] p-0 ${rating === num ? "bg-primary" : ""}`}
                  onClick={() => setRating(num)}
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
          <Button onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rating;
