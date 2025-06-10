
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ShoeCounter } from "./ShoeCounter";

export const AppHeader = () => {
  return (
    <header className="px-4 text-center py-8">
      <div className="mx-auto mb-8 py-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mx-auto w-48 h-48 flex items-center justify-center">
          <AspectRatio ratio={1 / 1} className="w-full h-full">
            <img 
              src="/lovable-uploads/ba6fcc1a-24b1-4e24-8750-43bdc56bb2fb.png" 
              alt="Reboot Logo" 
              className="h-full w-full object-contain" 
              loading="eager" 
            />
          </AspectRatio>
        </div>
      </div>
      
      <h1 className="font-bold mb-2 text-4xl">ReBOOT</h1>
      <p className="text-gray-600 mb-8">Beta</p>
      
      {/* Hero Shoe Counter */}
      <div className="flex justify-center mb-8">
        <ShoeCounter />
      </div>
    </header>
  );
};
