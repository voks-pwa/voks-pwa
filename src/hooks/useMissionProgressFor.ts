import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

import { useAuth } from "@/features/auth/useAuth";

export function useMissionProgressFor(missionId: number | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["missions-progress", user?.id],

    enabled: !!user && !!missionId,

    queryFn: async () => {
      const result = await supabase
        .from("missions_progress")
        .select("*")
        .eq("user_id", user!.id);

      if (result.error) throw result.error;

      return result.data ?? [];
    },

    select: (progress) =>
      missionId
        ? progress.find(
            (p) => p.mission_id === missionId,
          ) ?? null
        : null,
  });
}
