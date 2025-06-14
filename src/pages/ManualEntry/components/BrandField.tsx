
import React from "react";
import { Control } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { runningBrands } from "../constants";
import { ShoeFormData } from "../types";

interface BrandFieldProps {
  control: Control<ShoeFormData>;
  selectedBrand: string;
}

const BrandField: React.FC<BrandFieldProps> = ({ control, selectedBrand }) => {
  return (
    <>
      <FormField 
        control={control} 
        name="brand" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {runningBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} 
      />

      {selectedBrand === "Other" && (
        <FormField 
          control={control} 
          name="customBrand" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Brand *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter brand name" 
                  className="h-12 text-base" 
                  required 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
      )}
    </>
  );
};

export default BrandField;
