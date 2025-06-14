import React, { useEffect, useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
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
  const goalAmount = 1500; // Define the goal amount

  console.log('ShoeCounter render:', {
    count,
    isLoading,
    error,
    displayCount,
    goalAmount
  });

  // Smooth count animation with easing
  useEffect(() => {
    if (!isLoading && count !== displayCount) {
      setIsAnimating(true);
      const difference = count - displayCount;
      let startTime: number | null = null;
      const duration = 500; // Animation duration in ms

      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const newDisplayCount = Math.floor(displayCount + difference * progress);
        
        setDisplayCount(newDisplayCount);

        if (progress < 1) {
          requestAnimationFrame(animateCount);
        } else {
          setDisplayCount(count); // Ensure final count is accurate
          setIsAnimating(false);
        }
      };
      requestAnimationFrame(animateCount);
    }
  }, [count, displayCount, isLoading]);

  if (error) {
    console.error('ShoeCounter error:', error);
    return <div className="text-center py-6 animate-fade-in-up">
        <div className="glass-effect border border-red-100/60 rounded-2xl p-6 transition-all duration-300">
          <Zap className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium text-sm">Unable to load pair count</p>
          <p className="text-red-500 text-xs mt-1">{error}</p>
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

  const progressPercentage = Math.min(displayCount / goalAmount * 100, 100);

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

      {/* Count Display with Container and Apple-style Typography */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-gray-50/80 to-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/40 shadow-lg shadow-gray-500/10 p-6 mx-auto w-fit">
          <div
            className={`font-black text-6xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent transition-all duration-500 ease-out text-rendering-optimized relative overflow-hidden
              ${isAnimating ? 'blur-[1px]' : 'blur-0'}`}
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
          {displayCount < goalAmount ? `${(goalAmount - displayCount).toLocaleString()} more to reach ${goalAmount.toLocaleString()}!` : 'Goal reached! 🎉 Amazing progress!'}
        </p>
      </div>
    </div>;
};
