
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { useManualEntryForm } from "./ManualEntry/hooks/useManualEntryForm";
import { useSwipeNavigation } from "./ManualEntry/hooks/useSwipeNavigation";
import BrandField from "./ManualEntry/components/BrandField";
import ModelField from "./ManualEntry/components/ModelField";
import SizeField from "./ManualEntry/components/SizeField";
import ConditionField from "./ManualEntry/components/ConditionField";

const ManualEntry = () => {
  const navigate = useNavigate();
  const { form, selectedBrand, onSubmit, triggerHapticFeedback } = useManualEntryForm();

  useSwipeNavigation(triggerHapticFeedback);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <Button variant="ghost" className="mb-6 h-12 w-12" onClick={() => {
        triggerHapticFeedback();
        navigate("/");
      }}>
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back</span>
      </Button>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Enter Shoe Details</h1>
        <p className="text-sm text-gray-600 mb-4">I have a...</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BrandField control={form.control} selectedBrand={selectedBrand} />
            <ModelField control={form.control} />
            <SizeField control={form.control} />
            <ConditionField control={form.control} />

            <Button type="submit" className="w-full h-14 text-base font-medium">
              Continue
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ManualEntry;
