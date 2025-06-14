
import React from "react";
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { ShoeFormData } from "../types";

interface ModelFieldProps {
  control: Control<ShoeFormData>;
}

const ModelField: React.FC<ModelFieldProps> = ({ control }) => {
  return (
    <FormField 
      control={control} 
      name="model" 
      render={({ field }) => (
        <FormItem>
          <FormLabel>Model (Optional)</FormLabel>
          <FormControl>
            <Input 
              placeholder="Air Max, Cloudrunner, Sky lifestyle etc." 
              className="h-12 text-base" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} 
    />
  );
};

export default ModelField;
