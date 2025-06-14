
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ShoeCounter } from "./ShoeCounter";
import { Footprints } from "lucide-react";

export const AppHeader = () => {
  console.log('AppHeader rendering...');
  return <header className="px-6 py-12 text-center">
      {/* Ultra-modern Hero Section with Apple-style Design */}
      <div className="relative max-w-sm mx-auto">
        {/* Main Hero Card with Frosted Glass Effect */}
        <div className="group relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-gray-500/10 transition-all duration-700 ease-out hover:scale-[1.02] hover:shadow-3xl hover:shadow-gray-500/20 hover:bg-white/90">
          
          {/* Subtle Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.5)_1px,_transparent_0)] bg-[length:24px_24px] rounded-3xl"></div>
          
          {/* Logo Section with Premium Styling and Beta Badge */}
          <div className="relative z-10 mb-8">
            <div className="relative bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-6 mx-auto w-40 h-40 flex items-center justify-center mb-6 border border-white/40 px-[8px] py-[8px]">
              {/* Shoe Logo - now much bigger and with shimmer effect */}
              <Footprints
                className="h-24 w-24 text-gray-900 animate-shimmer-logo"
                style={{
                  maskImage:
                    "linear-gradient(120deg, rgba(255,255,255,0.35) 40%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.35) 60%)",
                  WebkitMaskImage:
                    "linear-gradient(120deg, rgba(255,255,255,0.35) 40%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.35) 60%)",
                }}
              />
              {/* Beta Badge Overlay */}
              <div className="absolute -top-2 -right-2">
                <span className="bg-gradient-to-r from-black to-gray-800 text-white font-semibold px-2 py-1 rounded-full shadow-lg shadow-black/25 border border-gray-400/20 text-xs">
                  Beta
                </span>
              </div>
            </div>
            
            {/* Title with Typography Hierarchy */}
            <div className="space-y-2">
              <h1 className="font-black text-4xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
                ReBOOT
              </h1>
            </div>
          </div>

          {/* Integrated Counter Section */}
          <div className="relative z-10">
            <ShoeCounter />
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full opacity-40 animate-pulse" style={{
          animationDelay: '1s'
        }}></div>
        </div>

        {/* Ambient Glow Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 via-gray-500/20 to-gray-600/20 rounded-3xl blur-3xl -z-10 opacity-60 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300/10 to-gray-500/10 rounded-3xl blur-2xl -z-20"></div>
      </div>
    </header>;
};
