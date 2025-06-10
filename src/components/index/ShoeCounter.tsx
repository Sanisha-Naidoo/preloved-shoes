
import React from 'react';
import { Footprints } from 'lucide-react';
import { useShoeCounter } from '@/hooks/useShoeCounter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const ShoeCounter = () => {
  const { count, isLoading, error } = useShoeCounter();

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Footprints className="h-4 w-4" />
        <span>Unable to load count</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Footprints className="h-4 w-4 text-gray-400" />
        <Skeleton className="h-5 w-20" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Footprints className="h-4 w-4 text-green-600" />
      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
        {count} shoe{count !== 1 ? 's' : ''} captured
      </Badge>
    </div>
  );
};
