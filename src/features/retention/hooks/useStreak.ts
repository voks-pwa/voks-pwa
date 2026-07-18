import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/useAuth";

export function useStreak() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["streak", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user!.id)
        .eq("streak_type", "daily")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
