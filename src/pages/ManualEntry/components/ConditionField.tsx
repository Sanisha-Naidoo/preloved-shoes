
import React from "react";
import { Control } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { ShoeFormData } from "../types";

interface ConditionFieldProps {
  control: Control<ShoeFormData>;
}

const ConditionField: React.FC<ConditionFieldProps> = ({ control }) => {
  return (
    <FormField 
      control={control} 
      name="condition" 
      render={({ field }) => (
        <FormItem>
          <FormLabel>Condition *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like_new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} 
    />
  );
};

export default ConditionField;
