
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ShoeCounter } from "./ShoeCounter";

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
            <div className="relative bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-4 mx-auto w-32 h-32 flex items-center justify-center mb-6 border border-white/40 px-[8px] py-[8px]">
              {/* Beautiful Heart Logo with Lovable-style gradients */}
              <svg 
                className="h-20 w-20 object-contain rounded-xl" 
                viewBox="0 0 120 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Gradient definitions for modern look */}
                <defs>
                  <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="30%" stopColor="#ee5a52" />
                    <stop offset="70%" stopColor="#ff4757" />
                    <stop offset="100%" stopColor="#c44569" />
                  </linearGradient>
                  <linearGradient id="heartShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#000000" opacity="0.1" />
                    <stop offset="100%" stopColor="#000000" opacity="0.3" />
                  </linearGradient>
                  <linearGradient id="heartHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" opacity="0.8" />
                    <stop offset="50%" stopColor="#ffffff" opacity="0.3" />
                    <stop offset="100%" stopColor="#ffffff" opacity="0.1" />
                  </linearGradient>
                </defs>
                
                {/* Heart shadow for depth */}
                <path 
                  d="M60 95 C55 90 25 65 25 40 C25 25 35 15 50 15 C55 15 60 20 60 20 C60 20 65 15 70 15 C85 15 95 25 95 40 C95 65 65 90 60 95 Z" 
                  fill="url(#heartShadow)"
                  transform="translate(2, 3)"
                />
                
                {/* Main heart shape */}
                <path 
                  d="M60 92 C55 87 25 62 25 37 C25 22 35 12 50 12 C55 12 60 17 60 17 C60 17 65 12 70 12 C85 12 95 22 95 37 C95 62 65 87 60 92 Z" 
                  fill="url(#heartGradient)"
                />
                
                {/* Heart highlight for 3D effect */}
                <path 
                  d="M60 92 C55 87 25 62 25 37 C25 22 35 12 50 12 C55 12 60 17 60 17 C60 17 65 12 70 12 C85 12 95 22 95 37 C95 62 65 87 60 92 Z" 
                  fill="url(#heartHighlight)"
                  opacity="0.6"
                />
                
                {/* Subtle inner glow */}
                <circle 
                  cx="45" 
                  cy="30" 
                  r="8" 
                  fill="white" 
                  opacity="0.4"
                />
                
                {/* Small sparkle effect */}
                <circle 
                  cx="75" 
                  cy="25" 
                  r="2" 
                  fill="white" 
                  opacity="0.8"
                />
                <circle 
                  cx="35" 
                  cy="45" 
                  r="1.5" 
                  fill="white" 
                  opacity="0.6"
                />
              </svg>
              
              {/* Beta Badge Overlay */}
              <div className="absolute -top-2 -right-2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-2 py-1 rounded-full shadow-lg shadow-indigo-500/25 border border-white/20 text-xs">
                  Beta
                </span>
              </div>
            </div>
            
            {/* Title with Typography Hierarchy */}
            <div className="space-y-2">
              <h1 className="font-black text-4xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                ReBOOT
              </h1>
            </div>
          </div>

          {/* Integrated Counter Section */}
          <div className="relative z-10">
            <ShoeCounter />
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-40 animate-pulse" style={{
          animationDelay: '1s'
        }}></div>
        </div>

        {/* Ambient Glow Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-500/20 to-pink-600/20 rounded-3xl blur-3xl -z-10 opacity-60 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/10 to-purple-500/10 rounded-3xl blur-2xl -z-20"></div>
      </div>
    </header>;
};
