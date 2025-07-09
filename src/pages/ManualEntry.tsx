
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { useManualEntryForm } from "./ManualEntry/hooks/useManualEntryForm";
import { useSwipeNavigation } from "./ManualEntry/hooks/useSwipeNavigation";
import { useStepperProgress } from "@/hooks/useStepperProgress";
import { Stepper } from "@/components/ui/stepper";
import BrandField from "./ManualEntry/components/BrandField";
import ModelField from "./ManualEntry/components/ModelField";
import SizeField from "./ManualEntry/components/SizeField";
import ConditionField from "./ManualEntry/components/ConditionField";

const ManualEntry = () => {
  const navigate = useNavigate();
  const { form, selectedBrand, onSubmit, triggerHapticFeedback, validateSize } = useManualEntryForm();
  const { steps, currentStep } = useStepperProgress();

  useSwipeNavigation(triggerHapticFeedback);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col relative overflow-hidden p-4">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.3)_1px,_transparent_0)] bg-[length:32px_32px]"></div>
      {/* Ambient Background Shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-200/15 to-teal-200/15 rounded-full blur-3xl opacity-40"></div>
      <Button 
        variant="ghost" 
        className="mb-6 relative z-50 pointer-events-auto" 
        onClick={(e) => {
          console.log("Back button clicked", e);
          e.preventDefault();
          e.stopPropagation();
          triggerHapticFeedback();
          navigate(-1);
        }}
        onMouseDown={() => console.log("Mouse down on back button")}
        onMouseUp={() => console.log("Mouse up on back button")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-md mx-auto relative z-10">
        {/* Progress Stepper */}
        <div className="mb-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <h1 className="text-2xl font-bold mb-6">Enter Shoe Details</h1>
        <p className="text-sm text-gray-600 mb-4">I have a...</p>

        <div className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl shadow-gray-500/10 rounded-3xl p-6 transition-all duration-500 ease-out hover:shadow-3xl hover:shadow-gray-500/15 hover:bg-white/80">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BrandField control={form.control} selectedBrand={selectedBrand} />
            <ModelField control={form.control} />
            <SizeField control={form.control} validateSize={validateSize} />
            <ConditionField control={form.control} />

            <Button type="submit" className="w-full h-14 text-base font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/30 border-0 rounded-2xl button-premium">
              Continue
            </Button>
          </form>
        </Form>
        </div>
      </div>
    </div>
  );
};

export default ManualEntry;
