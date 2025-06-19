
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ShoeCounter } from "./ShoeCounter";

export const AppHeader = () => {
  console.log('AppHeader rendering...');
  return <header className="px-6 py-12 text-center">
      {/* Ultra-modern Hero Section with Apple-style Design */}
      <div className="relative max-w-sm mx-auto">
        {/* Main Hero Card with Frosted Glass Effect - Added padding for beta badge */}
        <div className="group relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 pt-12 shadow-2xl shadow-gray-500/10 transition-all duration-700 ease-out hover:scale-[1.02] hover:shadow-3xl hover:shadow-gray-500/20 hover:bg-white/90 overflow-visible">
          
          {/* Subtle Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.5)_1px,_transparent_0)] bg-[length:24px_24px] rounded-3xl"></div>
          
          {/* Beta Badge - Positioned in left corner */}
          <div className="absolute top-4 left-4 z-20">
            <div className="transition-all duration-300 group-hover:scale-105">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-2.5 py-1 rounded-full shadow-lg shadow-indigo-500/20 border border-white/20 text-xs transition-all duration-300 hover:shadow-indigo-500/40">
                Beta
              </span>
            </div>
          </div>
          
          {/* Logo Section with Premium Styling */}
          <div className="relative z-10 mb-8">
            <div className="relative bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 p-4 mx-auto w-32 h-32 flex items-center justify-center mb-6 border border-white/40 px-[8px] py-[8px] group/logo cursor-pointer">
              {/* Heart Icon with Interactive Effects */}
              <div className="relative w-20 h-20 transition-all duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-12">
                <svg 
                  className="w-full h-full transition-all duration-500 group-hover/logo:drop-shadow-lg" 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Gradient definitions for modern look */}
                  <defs>
                    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="25%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="75%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#ffffff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Outer rotating ring */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="url(#primaryGradient)" 
                    strokeWidth="3" 
                    strokeDasharray="20 10" 
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                    opacity="0.6"
                  />
                  
                  {/* Heart Shape with Interactive Effects */}
                  <g className="transition-all duration-500 group-hover/logo:scale-110" filter="url(#glow)">
                    {/* Main Heart Shape */}
                    <path 
                      d="M50 75 C35 60, 15 45, 15 30 C15 20, 25 15, 35 20 C40 22, 45 25, 50 30 C55 25, 60 22, 65 20 C75 15, 85 20, 85 30 C85 45, 65 60, 50 75 Z"
                      fill="url(#primaryGradient)" 
                      className="transition-all duration-500 group-hover/logo:fill-pink-400"
                    />
                    
                    {/* Heart Highlight */}
                    <path 
                      d="M50 70 C38 58, 22 45, 22 32 C22 25, 28 21, 35 24 C40 26, 45 29, 50 34 C55 29, 60 26, 65 24 C72 21, 78 25, 78 32 C78 45, 62 58, 50 70 Z"
                      fill="url(#accentGradient)"
                      opacity="0.8"
                    />
                    
                    {/* Inner Heart Glow */}
                    <path 
                      d="M50 65 C40 55, 28 44, 28 34 C28 29, 32 26, 37 28 C41 29, 45 32, 50 37 C55 32, 59 29, 63 28 C68 26, 72 29, 72 34 C72 44, 60 55, 50 65 Z"
                      fill="url(#centerGlow)"
                      className="transition-all duration-500 group-hover/logo:opacity-100"
                      opacity="0.6"
                    />
                  </g>
                  
                  {/* Floating geometric elements */}
                  <circle 
                    cx="75" 
                    cy="25" 
                    r="3" 
                    fill="url(#accentGradient)" 
                    className="animate-pulse transition-all duration-500 group-hover/logo:r-4"
                  />
                  <rect 
                    x="15" 
                    y="75" 
                    width="4" 
                    height="4" 
                    fill="url(#primaryGradient)" 
                    rx="1"
                    className="animate-pulse transition-all duration-500 group-hover/logo:rotate-45"
                    style={{ animationDelay: '0.5s' }}
                  />
                  <polygon 
                    points="80,70 85,75 80,80 75,75" 
                    fill="url(#accentGradient)"
                    className="animate-pulse transition-all duration-500 group-hover/logo:scale-125"
                    style={{ animationDelay: '1s' }}
                  />
                </svg>
                
                {/* Interactive particles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-2 left-4 w-1 h-1 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute top-6 right-2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute bottom-8 left-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                  <div className="absolute bottom-4 right-6 w-1 h-1 bg-pink-500 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
                </div>
                
                {/* Orbital elements */}
                <div className="absolute inset-0 animate-spin opacity-40 group-hover/logo:opacity-70 transition-opacity duration-500" style={{ animationDuration: '12s' }}>
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full transform -translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full transform -translate-x-1/2"></div>
                </div>
                
                {/* Pulsing glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-500/20 to-pink-600/20 rounded-full blur-xl opacity-0 group-hover/logo:opacity-60 transition-all duration-500 animate-pulse"></div>
              </div>
            </div>
            
            {/* Title with Typography Hierarchy - Consistent Colors */}
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

          {/* Floating Decorative Elements - Consistent Colors */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-40 animate-pulse" style={{
          animationDelay: '1s'
        }}></div>
        </div>

        {/* Ambient Glow Effects - Consistent Colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-500/20 to-pink-600/20 rounded-3xl blur-3xl -z-10 opacity-60 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/10 to-purple-500/10 rounded-3xl blur-2xl -z-20"></div>
      </div>
    </header>;
};
