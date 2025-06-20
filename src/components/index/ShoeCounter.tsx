import React from 'react';
import { useShoeCounter } from '@/hooks/useShoeCounter';
import { Loader2 } from 'lucide-react';

export const ShoeCounter = () => {
  const {
    count,
    isLoading,
    error
  } = useShoeCounter();
  
  console.log('ShoeCounter rendering with:', {
    count,
    isLoading,
    error
  });
  
  if (error) {
    console.error('ShoeCounter error:', error);
    return (
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium animate-pulse">BRB, running an errand</span>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium animate-pulse">BRB, running an errand</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="text-center space-y-4">
      {/* Count Display with Box and Shadow */}
      <div className="relative">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/10 p-6 mx-auto border border-white/40 transition-all duration-500 hover:shadow-xl hover:shadow-black/15 hover:bg-white/70">
          <div className="space-y-2">
            <div className="relative">
              <div className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent shimmer-text">
                {count.toLocaleString()}
              </div>
              {/* Shimmer overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 animate-shimmer-sweep"></div>
            </div>
            <div className="text-sm font-medium text-gray-600">Pairs collected so far</div>
          </div>
        </div>
      </div>
      
      {/* Community Message */}
      <div className="space-y-2">
        <div className="text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Join the community effort!
        </div>
        <div className="text-sm text-gray-600 font-medium leading-relaxed">
          Help us create a sustainable future by giving your pre-loved shoes a second chance
        </div>
      </div>
    </div>
  );
};
