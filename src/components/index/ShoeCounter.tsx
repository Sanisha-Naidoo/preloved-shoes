import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, Footprints } from 'lucide-react';
import { useShoeCounter } from '@/hooks/useShoeCounter';
import { Skeleton } from '@/components/ui/skeleton';

export const ShoeCounter = () => {
  const {
    count,
    isLoading,
    error
  } = useShoeCounter();
  const [displayCount, setDisplayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  console.log('ShoeCounter render:', {
    count,
    isLoading,
    error,
    displayCount
  });

  // Smooth count animation with easing
  useEffect(() => {
    if (!isLoading && count !== displayCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayCount(count);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [count, displayCount, isLoading]);
  if (error) {
    console.error('ShoeCounter error:', error);
    return <div className="text-center py-6 animate-fade-in-up">
        <div className="glass-effect border border-red-100/60 rounded-2xl p-6 transition-all duration-300">
          <Zap className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium text-sm">Unable to load pair count</p>
        </div>
      </div>;
  }
  if (isLoading) {
    console.log('ShoeCounter loading...');
    return <div className="text-center py-6 animate-fade-in-up">
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mx-auto w-20 h-20 flex items-center justify-center border border-gray-100/50">
            <Sparkles className="h-8 w-8 text-gray-400 animate-pulse" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-24 mx-auto rounded-xl bg-gray-100/80" />
            <Skeleton className="h-4 w-32 mx-auto rounded-lg bg-gray-100/60" />
          </div>
        </div>
      </div>;
  }
  const progressPercentage = Math.min(displayCount / 6000 * 100, 100);
  return <div className="relative text-center py-2 animate-scale-in">
      {/* Floating Micro-interaction Elements */}
      <div className="absolute -top-1 -left-1 opacity-40 animate-float">
        <div className="w-1.5 h-1.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
      </div>
      <div className="absolute -top-1 -right-1 opacity-30 animate-float" style={{
      animationDelay: '0.5s'
    }}>
        <div className="w-1 h-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full"></div>
      </div>

      {/* Central Counter Icon with Premium Styling - Static Version */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-black via-gray-800 to-black rounded-2xl p-4 mx-auto w-16 h-16 flex items-center justify-center shadow-xl shadow-black/30 border border-gray-400/30">
          <Footprints className="h-7 w-7 text-white" />
          
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
        </div>
      </div>

      {/* Count Display with Apple-style Typography and shimmer */}
      <div className="mb-6">
        <div
          className={`font-black text-6xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent transition-all duration-500 ease-out text-rendering-optimized relative overflow-hidden
            ${isAnimating ? 'scale-110 blur-[1px]' : 'scale-100 blur-0'}`}
          style={{
            // Animate shimmer via background
            backgroundImage:
              "linear-gradient(100deg, #222 30%, #fff 50%, #222 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer-counter 2s linear infinite"
          }}
        >
          {displayCount.toLocaleString()}
        </div>
      </div>

      {/* Description with Refined Spacing */}
      <div className="space-y-3 mb-6">
        <div className="text-xl font-bold text-gray-800 tracking-tight text-rendering-optimized">
          {displayCount !== 1 ? 'Pairs' : 'Pair'} Captured
        </div>
        <div className="text-gray-600 font-medium text-lg animate-pulse">
          Join the community effort!
        </div>
      </div>

      {/* Progress Bar with Frosted Glass Design */}
      <div className="space-y-3">
        <div className="bg-gray-100/60 backdrop-blur-sm rounded-full h-3 overflow-hidden border border-gray-200/40 shadow-inner">
          <div className="bg-gradient-to-r from-black via-gray-800 to-black h-full rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden" style={{
          width: `${progressPercentage}%`
        }}>
            {/* Animated Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <p className="text-gray-600 font-medium tracking-wide text-2xl">
          {displayCount < 6000 ? `${(6000 - displayCount).toLocaleString()} more to reach 6,000!` : 'Amazing progress! 🎉'}
        </p>
      </div>
    </div>;
};

// Add to your CSS (src/index.css) for shimmer on logo and counter if not present:
// @keyframes shimmer-logo {
//   0% { mask-position: -100% 0; }
//   100% { mask-position: 200% 0; }
// }
// .animate-shimmer-logo {
//   animation: shimmer-logo 2s linear infinite;
//   mask-size: 200% 100%;
// }
// @keyframes shimmer-counter {
//   0% { background-position: -100% 0; }
//   100% { background-position: 200% 0; }
// }
