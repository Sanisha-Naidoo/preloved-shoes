
import { useEffect, useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { useShoeCounter } from '@/hooks/useShoeCounter';
import { Skeleton } from '@/components/ui/skeleton';

export const ShoeCounter = () => {
  const { count, isLoading, error } = useShoeCounter();
  const [displayCount, setDisplayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  console.log('ShoeCounter render:', { count, isLoading, error, displayCount });

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
    console.error('ShoeCounter error:', error);
    return (
      <div className="text-center">
        <Zap className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-600 font-medium text-sm">Unable to load pair count</p>
      </div>
    );
  }

  if (isLoading) {
    console.log('ShoeCounter loading...');
    return (
      <div className="text-center">
        <Sparkles className="h-12 w-12 text-slate-400 animate-pulse mx-auto mb-4" />
        <Skeleton className="h-12 w-24 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    );
  }

  console.log('ShoeCounter rendering counter with count:', displayCount);

  return (
    <div className="relative text-center">
      {/* Decorative Icons */}
      <div className="absolute -top-2 -left-2 opacity-60">
        <Sparkles className="h-4 w-4 text-green-400 animate-pulse" />
      </div>
      <div className="absolute -top-2 -right-2 opacity-60">
        <Zap className="h-4 w-4 text-emerald-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="absolute -bottom-2 -left-2 opacity-40">
        <Sparkles className="h-3 w-3 text-teal-400 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-40">
        <Zap className="h-3 w-3 text-green-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Central Counter Icon */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center shadow-lg">
          <Sparkles className="h-8 w-8 text-white animate-pulse" />
        </div>
      </div>

      {/* Count Display */}
      <div className="mb-4">
        <div className={`text-5xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
          {displayCount}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="text-xl font-bold text-green-800">
          {displayCount !== 1 ? 'Pairs' : 'Pair'} Captured
        </div>
        <div className="text-green-600 font-medium">
          Join the community effort!
        </div>
      </div>

      {/* Progress Indicator */}
      <div>
        <div className="bg-green-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min((displayCount / 6000) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-green-600 mt-2 font-medium">
          {displayCount < 6000 ? `${6000 - displayCount} more to reach 6000!` : 'Amazing progress! 🎉'}
        </p>
      </div>

      {/* Real-time indicator */}
      <div className="absolute -top-4 -right-4">
        <div className="bg-red-500 rounded-full p-1 shadow-lg animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
