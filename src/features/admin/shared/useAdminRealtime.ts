import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

export function useAdminRealtime<T extends Record<string, unknown>>(
  table: string,
  callback: (payload: T) => void,
  subscriptionKey: string,
) {
  useEffect(() => {
    const channel = supabase
      .channel(`admin-${subscriptionKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          callback(payload.new as T);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, callback, subscriptionKey]);
}
