import { useQuery } from "@tanstack/react-query";

import { getUsers, getUserDetail } from "../api/users";

interface UsersQuery {
  search?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

export function useUsers(query: UsersQuery = {}) {
  return useQuery({
    queryKey: ["admin-users", query],
    queryFn: () => getUsers(query),
  });
}

export function useUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => getUserDetail(userId!),
    enabled: !!userId,
  });
}
