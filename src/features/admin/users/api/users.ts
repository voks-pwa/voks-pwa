import { supabase } from "@/lib/supabase";

import type { AdminUser, UserDetailResponse } from "../types";

interface UsersQuery {
  search?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

export async function getUsers(query: UsersQuery = {}): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: {
      search: query.search ?? "",
      role: query.role ?? "",
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    },
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error ?? "Failed to load users");

  return {
    users: data.users ?? [],
    total: data.total ?? 0,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 10,
  };
}

export async function getUserDetail(userId: string): Promise<UserDetailResponse> {
  const { data, error } = await supabase.functions.invoke("admin-user-detail", {
    body: { userId },
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error ?? "Failed to load user detail");

  return data;
}
