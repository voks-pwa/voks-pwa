import { supabase } from "@/lib/supabase";
import type { Profile, UpdateProfileInput } from "../types";

export async function findProfile(id: string) {

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data as Profile | null;
}

export async function findProfiles() {

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data as Profile[];
}

export async function updateProfileRow(
  id: string,
  input: UpdateProfileInput,
) {

  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as Profile;
}