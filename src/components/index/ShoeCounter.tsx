
import React, { useEffect, useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { useShoeCounter } from '@/hooks/useShoeCounter';
import { Skeleton } from '@/components/ui/skeleton';

export const ShoeCounter = () => {
  const { count, isLoading, error } = useShoeCounter();
  const [displayCount, setDisplayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate count changes
  useEffect(() => {
    if (!isLoading && count !== displayCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayCount(count);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [count, displayCount, isLoading]);

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-3xl p-8 text-center shadow-lg">
        <Zap className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 font-medium">Unable to load pair count</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-3xl p-12 text-center shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <Sparkles className="h-16 w-16 text-slate-400 animate-pulse" />
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-6 w-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Counter Card */}
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-3xl p-12 text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
        
        {/* Sparkle Icons */}
        <div className="absolute top-4 left-4 opacity-60">
          <Sparkles className="h-6 w-6 text-green-400 animate-pulse" />
        </div>
        <div className="absolute top-4 right-4 opacity-60">
          <Zap className="h-6 w-6 text-emerald-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute bottom-4 left-6 opacity-40">
          <Sparkles className="h-4 w-4 text-teal-400 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-4 right-6 opacity-40">
          <Zap className="h-4 w-4 text-green-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Central Icon */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center shadow-lg">
            <Sparkles className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>

        {/* Count Display */}
        <div className="mb-4">
          <div className={`text-7xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            {displayCount}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="text-2xl font-bold text-green-800">
            {displayCount !== 1 ? 'Pairs' : 'Pair'} Captured
          </div>
          <div className="text-green-600 font-medium text-lg">
            Join the community effort!
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="bg-green-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((displayCount / 6000) * 100, 100)}%` }}
            />
          </div>
          <p className="text-sm text-green-600 mt-2 font-medium">
            {displayCount < 6000 ? `${6000 - displayCount} more to reach 6000!` : 'Amazing progress! 🎉'}
          </p>
        </div>

        {/* Real-time indicator */}
        <div className="absolute -top-2 -right-2">
          <div className="bg-red-500 rounded-full p-2 shadow-lg animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
    </div>
  );
};
