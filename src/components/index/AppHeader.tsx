
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
              {/* Modern Lovable-style Logo */}
              <svg 
                className="h-20 w-20 object-contain rounded-xl" 
                viewBox="0 0 120 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="bootGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="refreshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                
                {/* Main boot silhouette with modern curves */}
                <path 
                  d="M30 85 C30 75 28 65 30 55 C32 45 35 35 42 28 C50 20 60 18 70 18 C80 18 90 20 98 28 C105 35 108 45 110 55 C112 65 110 75 110 85 C110 90 105 92 100 92 L40 92 C35 92 30 90 30 85 Z" 
                  fill="url(#bootGradient)" 
                  opacity="0.95"
                />
                
                {/* Sleek toe section */}
                <ellipse 
                  cx="70" 
                  cy="30" 
                  rx="25" 
                  ry="15" 
                  fill="url(#accentGradient)" 
                  opacity="0.8"
                />
                
                {/* Modern lacing system */}
                <g stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
                  <line x1="55" y1="40" x2="85" y2="40"/>
                  <line x1="57" y1="50" x2="83" y2="50"/>
                  <line x1="59" y1="60" x2="81" y2="60"/>
                  <line x1="61" y1="70" x2="79" y2="70"/>
                </g>
                
                {/* Lovable-style refresh icon */}
                <circle 
                  cx="95" 
                  cy="25" 
                  r="12" 
                  fill="url(#refreshGradient)" 
                  opacity="0.95"
                />
                
                {/* Refresh arrow with modern styling */}
                <path 
                  d="M88 25 C88 20 92 16 97 16 C102 16 106 20 106 25 C106 30 102 34 97 34 M97 19 L100 16 L100 22 M97 31 L94 34 L94 28" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
                
                {/* Subtle shadow/depth */}
                <ellipse 
                  cx="70" 
                  cy="95" 
                  rx="35" 
                  ry="8" 
                  fill="#000000" 
                  opacity="0.1"
                />
                
                {/* Highlight for premium feel */}
                <path 
                  d="M35 50 C45 35 60 25 75 25 C85 25 95 30 100 40" 
                  stroke="white" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  fill="none" 
                  opacity="0.4"
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
