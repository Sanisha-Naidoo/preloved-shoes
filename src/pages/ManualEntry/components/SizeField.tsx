
import React from "react";
import { Control } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { ShoeFormData } from "../types";

interface SizeFieldProps {
  control: Control<ShoeFormData>;
}

const SizeField: React.FC<SizeFieldProps> = ({ control }) => {
  return (
    <div className="space-y-2">
      <Label>Size *</Label>
      <div className="flex gap-2">
        <div className="w-1/3">
          <FormField 
            control={control} 
            name="sizeUnit" 
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="US">US</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} 
          />
        </div>
        
        <div className="w-2/3">
          <FormField 
            control={control} 
            name="size" 
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Enter size number" 
                    inputMode="decimal" 
                    pattern="[0-9]*\.?[0-9]*" 
                    className="h-12 text-base" 
                    required 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
        </div>
      </div>
    </div>
  );
};

export default SizeField;
