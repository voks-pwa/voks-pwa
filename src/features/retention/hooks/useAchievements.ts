import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/useAuth";

export function useAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["achievements", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*, achievements (*)")
        .eq("user_id", user!.id);

      if (error) throw error;
      return data ?? [];
    },
  });
}
