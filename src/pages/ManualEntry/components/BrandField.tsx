
import React, { useState } from "react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { runningBrands } from "../constants";
import { ShoeFormData } from "../types";

interface BrandFieldProps {
  control: Control<ShoeFormData>;
  selectedBrand: string;
}

const BrandField: React.FC<BrandFieldProps> = ({ control, selectedBrand }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FormField 
        control={control} 
        name="brand" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand *</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-12 justify-between text-base"
                  >
                    {field.value
                      ? runningBrands.find((brand) => brand === field.value)
                      : "Select a brand"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search brands..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No brand found.</CommandEmpty>
                    <CommandGroup>
                      {runningBrands.map((brand) => (
                        <CommandItem
                          key={brand}
                          value={brand}
                          onSelect={(currentValue) => {
                            field.onChange(currentValue === field.value ? "" : currentValue);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === brand ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {brand}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
