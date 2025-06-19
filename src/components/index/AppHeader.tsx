
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
            <div className="relative bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-4 mx-auto w-32 h-32 flex items-center justify-center mb-6 border border-white/40 px-[8px] py-[8px] group/logo cursor-pointer">
              {/* Beautiful Heart Logo with Interactive Effects */}
              <div className="relative w-20 h-20 transition-all duration-500 group-hover/logo:scale-110">
                <svg 
                  className="w-full h-full transition-all duration-500 group-hover/logo:drop-shadow-lg" 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Gradient definitions for modern look */}
                  <defs>
                    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff6b6b" />
                      <stop offset="25%" stopColor="#ee5a52" />
                      <stop offset="50%" stopColor="#ff4757" />
                      <stop offset="75%" stopColor="#c44569" />
                      <stop offset="100%" stopColor="#8e44ad" />
                    </linearGradient>
                    <linearGradient id="heartHighlight" x1="0%" y1="0%" x2="60%" y2="60%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                    </linearGradient>
                    <radialGradient id="heartGlow" cx="50%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                      <stop offset="70%" stopColor="#ffffff" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  {/* Heart shadow for depth */}
                  <path 
                    d="M50 85 C45 80 15 55 15 30 C15 15 25 5 40 5 C45 8 50 15 50 15 C50 15 55 8 60 5 C75 5 85 15 85 30 C85 55 55 80 50 85 Z" 
                    fill="#000000"
                    opacity="0.15"
                    transform="translate(2, 3)"
                    className="transition-all duration-500 group-hover/logo:opacity-25"
                  />
                  
                  {/* Main heart shape */}
                  <path 
                    d="M50 82 C45 77 15 52 15 27 C15 12 25 2 40 2 C45 5 50 12 50 12 C50 12 55 5 60 2 C75 2 85 12 85 27 C85 52 55 77 50 82 Z" 
                    fill="url(#heartGradient)"
                    className="transition-all duration-500 group-hover/logo:scale-105"
                  />
                  
                  {/* Heart highlight for 3D effect */}
                  <path 
                    d="M50 82 C45 77 15 52 15 27 C15 12 25 2 40 2 C45 5 50 12 50 12 C50 12 55 5 60 2 C75 2 85 12 85 27 C85 52 55 77 50 82 Z" 
                    fill="url(#heartHighlight)"
                    className="transition-all duration-500 group-hover/logo:opacity-80"
                  />
                  
                  {/* Inner glow effect */}
                  <ellipse 
                    cx="50" 
                    cy="30" 
                    rx="30" 
                    ry="25" 
                    fill="url(#heartGlow)"
                    className="transition-all duration-500 group-hover/logo:opacity-90"
                  />
                  
                  {/* Sparkle effects */}
                  <circle 
                    cx="70" 
                    cy="20" 
                    r="2" 
                    fill="white" 
                    className="animate-pulse opacity-80 transition-all duration-500 group-hover/logo:opacity-100 group-hover/logo:r-3"
                  />
                  <circle 
                    cx="30" 
                    cy="35" 
                    r="1.5" 
                    fill="white" 
                    className="animate-pulse opacity-60 transition-all duration-500 group-hover/logo:opacity-90"
                    style={{ animationDelay: '0.5s' }}
                  />
                  <circle 
                    cx="65" 
                    cy="45" 
                    r="1" 
                    fill="white" 
                    className="animate-pulse opacity-40 transition-all duration-500 group-hover/logo:opacity-70"
                    style={{ animationDelay: '1s' }}
                  />
                </svg>
                
                {/* Floating particles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-2 left-4 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute top-6 right-2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute bottom-8 left-2 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                  <div className="absolute bottom-4 right-6 w-1 h-1 bg-pink-500 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
                </div>
                
                {/* Pulsing glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-red-500/20 to-purple-600/20 rounded-full blur-xl opacity-0 group-hover/logo:opacity-60 transition-all duration-500 animate-pulse"></div>
              </div>
              
              {/* Beta Badge Overlay */}
              <div className="absolute -top-2 -right-2 transition-all duration-300 group-hover/logo:scale-110">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-2 py-1 rounded-full shadow-lg shadow-indigo-500/25 border border-white/20 text-xs transition-all duration-300 hover:shadow-indigo-500/40">
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
