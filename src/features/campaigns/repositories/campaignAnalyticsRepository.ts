import { supabase } from "@/lib/supabase";

export async function fetchCampaignAnalytics(slug: string) {
  const { data, error } = await supabase.functions.invoke("campaign-analytics", {
    body: { slug },
  });

  if (error) throw error;

  return { data, error: null as string | null };
}
