import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useShoeCounter = () => {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('useShoeCounter hook state:', { count, isLoading, error });

  useEffect(() => {
    console.log('useShoeCounter effect starting...');
    
    // Fetch initial count using raw SQL
    const fetchInitialCount = async () => {
      try {
        console.log('Fetching initial shoe count...');
        const { data: countResult, error: fetchError } = await supabase
          .rpc('exec_sql', { 
            sql: 'SELECT COUNT(*) as count FROM preloved.shoes',
            params: []
          });

        if (fetchError) {
          console.error('Error fetching shoe count:', fetchError);
          setError('Failed to load shoe count');
        } else {
          const shoeCount = countResult?.[0]?.count || 0;
          console.log('Initial shoe count fetched:', shoeCount);
          setCount(parseInt(shoeCount));
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
          schema: 'preloved',
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