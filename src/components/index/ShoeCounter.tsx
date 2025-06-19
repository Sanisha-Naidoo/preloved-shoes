
import React from 'react';
import { useShoeCounter } from '@/hooks/useShoeCounter';
import { Shirt } from 'lucide-react';

export const ShoeCounter = () => {
  const { count, isLoading, error } = useShoeCounter();
  
  console.log('ShoeCounter rendering with:', { count, isLoading, error });

  if (error) {
    console.error('ShoeCounter error:', error);
    return (
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-red-500">
          <Shirt className="h-5 w-5 animate-pulse" />
          <span className="text-sm font-medium">Unable to load count</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Shirt className="h-5 w-5 animate-pulse" />
          <span className="text-sm font-medium animate-pulse">hang on, fetching stuff...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-3">
      <div className="space-y-1">
        <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {count.toLocaleString()}
        </div>
        <div className="text-sm font-medium text-gray-600">
          shoes collected so far
        </div>
      </div>
    </div>
  );
};
