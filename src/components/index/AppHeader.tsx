
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ShoeCounter } from "./ShoeCounter";

export const AppHeader = () => {
  console.log('AppHeader rendering...');
  
  return (
    <header className="px-6 py-12 text-center">
      {/* Ultra-modern Hero Section with Apple-style Design */}
      <div className="relative max-w-sm mx-auto">
        {/* Main Hero Card with Frosted Glass Effect */}
        <div className="group relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-green-500/10 transition-all duration-700 ease-out hover:scale-[1.02] hover:shadow-3xl hover:shadow-green-500/20 hover:bg-white/90">
          
          {/* Subtle Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.5)_1px,_transparent_0)] bg-[length:24px_24px] rounded-3xl"></div>
          
          {/* Logo Section with Premium Styling */}
          <div className="relative z-10 mb-8">
            <div className="group/logo bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-6 mx-auto w-28 h-28 flex items-center justify-center mb-6 transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 border border-white/40">
              <AspectRatio ratio={1 / 1} className="w-full h-full">
                <img 
                  src="/lovable-uploads/ba6fcc1a-24b1-4e24-8750-43bdc56bb2fb.png" 
                  alt="Reboot Logo" 
                  className="h-full w-full object-contain transition-all duration-300 group-hover/logo:scale-110" 
                  loading="eager" 
                />
              </AspectRatio>
            </div>
            
            {/* Title with Typography Hierarchy */}
            <div className="space-y-2">
              <h1 className="font-black text-4xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
                ReBOOT
              </h1>
              <div className="inline-flex items-center justify-center">
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-green-500/25 border border-green-400/20">
                  Beta
                </span>
              </div>
            </div>
          </div>

          {/* Integrated Counter Section */}
          <div className="relative z-10">
            <ShoeCounter />
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Ambient Glow Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-teal-400/20 rounded-3xl blur-3xl -z-10 opacity-60 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-300/10 to-emerald-300/10 rounded-3xl blur-2xl -z-20"></div>
      </div>
    </header>
  );
};
