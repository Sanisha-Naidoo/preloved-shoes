
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useShoeCounter = () => {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial count
    const fetchInitialCount = async () => {
      try {
        const { count: shoeCount, error } = await supabase
          .from('shoes')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Error fetching shoe count:', error);
          setError('Failed to load shoe count');
        } else {
          setCount(shoeCount || 0);
        }
      } catch (err) {
        console.error('Error in fetchInitialCount:', err);
        setError('Failed to load shoe count');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialCount();

    // Set up real-time subscription for new shoe insertions
    const channel = supabase
      .channel('shoe-count-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shoes'
        },
        (payload) => {
          console.log('New shoe added:', payload);
          setCount(prevCount => prevCount + 1);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { count, isLoading, error };
};
