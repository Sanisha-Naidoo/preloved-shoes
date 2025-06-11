
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ShoeCounter } from "./ShoeCounter";

export const AppHeader = () => {
  console.log('AppHeader rendering...');
  
  return (
    <header className="px-4 text-center py-8">
      {/* Integrated Hero Section with Logo and Counter */}
      <div className="relative">
        {/* Main Integrated Hero Card */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-3xl p-8 text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl mx-auto max-w-md">
          
          {/* Logo Section */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-4 mx-auto w-32 h-32 flex items-center justify-center mb-4">
              <AspectRatio ratio={1 / 1} className="w-full h-full">
                <img 
                  src="/lovable-uploads/ba6fcc1a-24b1-4e24-8750-43bdc56bb2fb.png" 
                  alt="Reboot Logo" 
                  className="h-full w-full object-contain" 
                  loading="eager" 
                />
              </AspectRatio>
            </div>
            
            {/* Title and Beta */}
            <h1 className="font-bold mb-1 text-3xl text-gray-800">ReBOOT</h1>
            <p className="text-gray-600 text-sm mb-6">Beta</p>
          </div>

          {/* Integrated Counter Section */}
          <div className="w-full">
            <ShoeCounter />
          </div>
        </div>

        {/* Glow effect for the entire hero */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
      </div>
    </header>
  );
};
