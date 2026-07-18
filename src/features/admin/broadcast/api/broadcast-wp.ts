import { supabase } from "@/lib/supabase";

export interface WPNotification {
  wp_id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  link: string;
  featured_image: { source_url: string } | null;
}

export async function listWPNotifications(): Promise<WPNotification[]> {
  const { data, error } = await supabase.functions.invoke(
    "admin-broadcast-wp",
    { body: { action: "list" } }
  );

  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "Failed to load WordPress notifications");

  return data.notifications ?? [];
}
