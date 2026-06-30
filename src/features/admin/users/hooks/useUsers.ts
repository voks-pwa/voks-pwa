import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

import type { AdminUser } from "../types";

export function useUsers() {

  return useQuery({

    queryKey: ["admin-users"],

    queryFn: async () => {

      const { data, error } = await supabase

        .from("profiles")

        .select(`
          id,
          display_name,
          email,
          role,
          badge_name,
          level,
          xp,
          current_vxp,
          avatar_url,
          created_at
        `)

        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) throw error;

      return data as AdminUser[];

    },

  });

}