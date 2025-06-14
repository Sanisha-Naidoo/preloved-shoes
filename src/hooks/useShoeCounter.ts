
import { useEffect, useState } from 'react';
// import { supabase } from '@/integrations/supabase/client'; // Supabase import no longer needed for static count

export const useShoeCounter = () => {
  // Set count to 1500 and isLoading to false as we are not fetching.
  const [count, setCount] = useState<number>(1500);
  const [isLoading, setIsLoading] = useState(false); // Data is "loaded" immediately
  const [error, setError] = useState<string | null>(null);

  console.log('useShoeCounter hook state (static):', { count, isLoading, error });

  // The useEffect for fetching initial count and real-time subscription is removed
  // to ensure the counter stays at the static value of 1500.

  // useEffect(() => {
  //   console.log('useShoeCounter effect starting...');
    
  //   // Fetch initial count
  //   const fetchInitialCount = async () => {
  //     try {
  //       console.log('Fetching initial shoe count...');
  //       const { count: shoeCount, error } = await supabase
  //         .from('shoes')
  //         .select('*', { count: 'exact', head: true });

  //       if (error) {
  //         console.error('Error fetching shoe count:', error);
  //         setError('Failed to load shoe count');
  //       } else {
  //         console.log('Initial shoe count fetched:', shoeCount);
  //         setCount(shoeCount || 0);
  //       }
  //     } catch (err) {
  //       console.error('Error in fetchInitialCount:', err);
  //       setError('Failed to load shoe count');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchInitialCount();

  //   // Set up real-time subscription for new shoe insertions
  //   console.log('Setting up real-time subscription...');
  //   const channel = supabase
  //     .channel('shoe-count-changes')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: 'INSERT',
  //         schema: 'public',
  //         table: 'shoes'
  //       },
  //       (payload) => {
  //         console.log('New shoe added:', payload);
  //         setCount(prevCount => prevCount + 1);
  //       }
  //     )
  //     .subscribe();

  //   // Cleanup subscription on unmount
  //   return () => {
  //     console.log('Cleaning up shoe counter subscription...');
  //     supabase.removeChannel(channel);
  //   };
  // }, []);

  return { count, isLoading, error };
};
