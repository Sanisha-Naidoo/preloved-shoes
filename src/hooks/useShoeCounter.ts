
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useShoeCounter = () => {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('useShoeCounter hook state:', { count, isLoading, error });

  useEffect(() => {
    console.log('useShoeCounter effect starting...');
    
    // Fetch initial count
    const fetchInitialCount = async () => {
      try {
        console.log('Fetching initial shoe count...');
        const { count: shoeCount, error: fetchError } = await supabase
          .from('shoes')
          .select('*', { count: 'exact', head: true });

        if (fetchError) {
          console.error('Error fetching shoe count:', fetchError);
          setError('Failed to load shoe count');
        } else {
          console.log('Initial shoe count fetched:', shoeCount);
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
    console.log('Setting up real-time subscription...');
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
          // Ensure payload.new exists and has the expected structure if needed,
          // for now, just incrementing.
          setCount(prevCount => prevCount + 1);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to shoe-count-changes');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Realtime subscription error:', status, err);
          setError('Realtime connection failed. Count may not be live.');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up shoe counter subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  return { count, isLoading, error };
};
